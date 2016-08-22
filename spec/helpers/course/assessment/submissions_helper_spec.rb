require 'rails_helper'

RSpec.describe Course::Assessment::SubmissionsHelper do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_owner) { course.course_users.owner.first }
    let(:assessment) { create(:assessment, :published_with_mcq_question, course: course) }
    let(:students) { create_list(:course_student, 3, course: course) }
    before do
      helper.define_singleton_method(:current_course) {}
      allow(helper).to receive(:current_course).and_return(course)

      # Create submissions of various statuses, but only 1 which is pending submission.
      create(:submission, :attempting, assessment: assessment, creator: students[0].user)
      create(:submission, :submitted, assessment: assessment, creator: students[1].user)
      create(:submission, :graded, assessment: assessment, creator: students[2].user)
    end

    describe '#pending_submissions_count' do
      subject { helper.pending_submissions_count }
      it { is_expected.to eq(assessment.submissions.with_submitted_state.count) }
    end

    describe '#my_students_pending_submissions_count' do
      let!(:staff) { create(:course_teaching_assistant, course: course) }
      before do
        helper.define_singleton_method(:current_course_user) {}
        allow(helper).to receive(:current_course_user).and_return(staff)
      end
      subject { helper.my_students_pending_submissions_count }

      context 'when current course user is a staff and has no students in my group' do
        it { is_expected.to eq(0) }
      end

      context 'when current course user is a staff and has group students' do
        let!(:group) { create(:course_group, course: course) }
        let!(:group_manager) { create(:course_group_manager, course_user: staff, group: group) }
        let!(:group_user) do
          create(:course_group_user, course: course, group: group, course_user: students[1])
        end

        it { is_expected.to eq(1) }
      end
    end
  end
end
