# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#opening_reminder' do
      let!(:now) { Time.zone.now }

      let(:user) { create(:course_user, course: course).user }
      let!(:video) { create(:video, start_at: now) }

      context 'when video is published' do
        it 'notify the users' do
          video.published = true

          expect_any_instance_of(Course::VideoNotifier).to receive(:video_opening).once
          subject.opening_reminder(user, video, video.start_at.to_f)
        end
      end

      context 'when video is a draft' do
        it 'does not notify the users' do
          expect_any_instance_of(Course::VideoNotifier).to_not receive(:video_opening)
          subject.opening_reminder(user, video, video.start_at.to_f)
        end
      end

      context "when video's start_date was changed" do
        it 'does not notify the users' do
          start_at = video.start_at.to_f
          video.start_at = now + 1.day

          expect_any_instance_of(Course::VideoNotifier).to_not receive(:video_opening)
          subject.opening_reminder(user, video, start_at)
        end
      end
    end

    describe '#closing_reminder' do
      let!(:now) { Time.zone.now }

      let(:user) { create(:course_user, course: course).user }
      let!(:video) { create(:video, end_at: now) }

      context 'when video is published' do
        it 'notify the users' do
          video.published = true

          expect_any_instance_of(Course::VideoNotifier).to receive(:video_closing).once
          subject.closing_reminder(user, video, video.end_at.to_f)
        end
      end

      context 'when video is a draft' do
        it 'does not notify the users' do
          expect_any_instance_of(Course::VideoNotifier).to_not receive(:video_closing)
          subject.closing_reminder(user, video, video.end_at.to_f)
        end
      end

      context "when video's end_date was changed" do
        it 'does not notify the users' do
          end_at = video.end_at.to_f
          video.end_at = now + 1.day

          expect_any_instance_of(Course::VideoNotifier).to_not receive(:video_closing)
          subject.closing_reminder(user, video, end_at)
        end
      end
    end
  end
end
