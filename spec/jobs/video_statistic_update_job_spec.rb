# frozen_string_literal: true
require 'rails_helper'

RSpec.describe VideoStatisticUpdateJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:video) { create(:video, course: course) }

    describe '#perform' do
      subject { VideoStatisticUpdateJob.perform_now }

      context 'video statistics' do
        it 'marks uncached video statistics as cached' do
          expect { subject }.
            to change { video.reload.statistic.cached }.from(false).to(true)
        end

        it 'skips already-cached video statistics' do
          video.statistic.update!(cached: true)

          expect(Course::Video::Statistic).not_to receive(:upsert)
          subject
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
          submission.statistic.update!(cached: true)

          expect_any_instance_of(Course::Video::Submission).not_to receive(:update_statistic)
          subject
          expect(submission.reload.statistic.cached).to be true
        end
      end
    end
  end
end
