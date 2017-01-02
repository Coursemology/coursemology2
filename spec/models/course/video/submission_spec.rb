# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video::Submission do
  it { is_expected.to act_as(Course::ExperiencePointsRecord) }
  it { is_expected.to belong_to(:video).inverse_of(:submissions) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:student) { create(:course_student, course: course).user }
    let(:video) { create(:video, course: course) }
    let(:submission) { create(:course_video_submission, video: video, creator: student) }

    describe 'validations' do
      context 'when the course user is different from the submission creator' do
        let(:different_student) { create(:course_student, course: course) }
        subject do
          build(:video_submission, video: video, course_user: different_student, creator: student)
        end

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:experience_points_record]).
            to include(I18n.
              t('activerecord.errors.models.course/video/submission.'\
                'attributes.experience_points_record.inconsistent_user'))
        end
      end

      context 'when a submission for the user and assessment already exists' do
        before { submission }
        subject { build(:video_submission, video: video, creator: student) }

        it 'is not valid' do
          expect(subject).not_to be_valid
          expect(subject.errors.messages[:base]).
            to include(I18n.
              t('activerecord.errors.models.course/video/submission.'\
                'submission_already_exists'))
        end
      end
    end

    describe 'callbacks from Course::Video::Submission::TodoConcern' do
      before { submission }
      let(:todo) do
        Course::LessonPlan::Todo.find_by(item_id: video.lesson_plan_item.id, user_id: student.id)
      end

      context 'when the submission is created' do
        it 'sets the todo to completed' do
          expect(todo.completed?).to be_truthy
        end
      end

      context 'when the submission is destroyed' do
        it 'sets the todo state to not started' do
          submission.destroy
          expect(todo.not_started?).to be_truthy
        end
      end
    end
  end
end
