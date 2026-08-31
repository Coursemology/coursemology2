# frozen_string_literal: true
require 'rails_helper'

RSpec.describe VideoStatisticUpdateJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:video) { create(:video, course: course) }

    describe '#perform', :sidekiq_same_thread do
      # VideoStatisticUpdateJob is NOT tenant-scoped — it caches EVERY uncached video/submission
      # statistic in the database. This suite runs without transactional fixtures or DatabaseCleaner,
      # so uncached statistics committed by other specs persist and would be picked up here. The
      # "skips already-cached" examples therefore run the job once to cache everything first, then
      # assert that a *second* run is a no-op — which is immune to leftover data and still verifies
      # that already-cached statistics are skipped.
      def perform_job
        perform_sidekiq_jobs { VideoStatisticUpdateJob.perform_later }
      end
      subject { perform_job }

      context 'video statistics' do
        it 'marks uncached video statistics as cached' do
          expect { subject }.
            to change { video.reload.statistic.cached }.from(false).to(true)
        end

        it 'skips already-cached video statistics' do
          perform_job # caches every uncached video statistic, including this one

          expect(Course::Video::Statistic).not_to receive(:upsert)
          perform_job # a second run must not re-upsert anything already cached
          expect(video.reload.statistic.cached).to be true
        end
      end

      context 'memory footprint' do
        let(:student) { create(:course_student, course: course).user }
        let!(:submission) { create(:video_submission, video: video, creator: student) }

        # Counts the rows ActiveRecord turns into objects, per class, while the block runs.
        def instantiated_records
          counts = Hash.new(0)
          subscriber = ActiveSupport::Notifications.subscribe('instantiation.active_record') do |*, payload|
            counts[payload[:class_name]] += payload[:record_count]
          end
          yield
          counts
        ensure
          ActiveSupport::Notifications.unsubscribe(subscriber)
        end

        # Regression: the job used to filter with `Enumerable#select` on an unscoped relation, so it
        # loaded EVERY video and submission in the database (it is not tenant-scoped) before
        # discarding the cached ones. The cost scaled with total table size rather than with the
        # amount of stale data, which is what exhausted the worker's memory in production.
        it 'does not load already-cached records' do
          perform_job # caches everything, so a second run has no work to do

          counts = instantiated_records { perform_job }

          expect(counts['Course::Video']).to eq(0)
          expect(counts['Course::Video::Submission']).to eq(0)
          expect(counts['Course::Video::Submission::Statistic']).to eq(0)
        end
      end

      context 'submission statistics' do
        let(:student) { create(:course_student, course: course).user }
        let!(:submission) { create(:video_submission, video: video, creator: student) }

        it 'marks uncached submission statistics as cached' do
          expect { subject }.
            to change { submission.reload.statistic.cached }.from(false).to(true)
        end

        it 'skips already-cached submission statistics' do
          perform_job # caches every uncached submission statistic, including this one

          expect_any_instance_of(Course::Video::Submission).not_to receive(:update_statistic)
          perform_job # a second run must not recompute anything already cached
          expect(submission.reload.statistic.cached).to be true
        end
      end
    end
  end
end
