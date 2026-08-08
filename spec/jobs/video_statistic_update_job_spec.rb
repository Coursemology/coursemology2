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
