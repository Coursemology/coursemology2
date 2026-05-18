# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GradebookController, type: :controller do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#index' do
      render_views
      subject { get :index, as: :json, params: { course_id: course } }

      context 'when the gradebook component is disabled' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        before do
          controller_sign_in(controller, ta.user)
          allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
        end

        it 'raises an component not found error' do
          expect { subject }.to raise_error(ComponentNotFoundError)
        end
      end

      context 'when a student visits the page' do
        let(:student) { create(:course_student, course: course) }
        before { controller_sign_in(controller, student.user) }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when a teaching assistant visits the page' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        before { controller_sign_in(controller, ta.user) }

        it { expect(subject).to be_successful }

        it 'returns tabs, assessments, and students keys' do
          subject
          data = JSON.parse(response.body)
          expect(data).to have_key('tabs')
          expect(data).to have_key('assessments')
          expect(data).to have_key('students')
        end
      end

      context 'when a manager visits the page' do
        let(:manager) { create(:course_manager, course: course) }
        before { controller_sign_in(controller, manager.user) }

        it { expect(subject).to be_successful }
      end

      context 'when an observer visits the page' do
        let(:observer) { create(:course_observer, course: course) }
        before { controller_sign_in(controller, observer.user) }

        it { expect(subject).to be_successful }
      end

      context 'with a published assessment and a graded submission' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        let(:tab) { course.assessment_categories.first.tabs.first }
        let!(:assessment) do
          create(:course_assessment_assessment, :published_with_mcq_question,
                 course: course, tab: tab)
        end
        let!(:student) { create(:course_student, course: course) }
        let!(:submission) do
          create(:course_assessment_submission, :graded,
                 assessment: assessment, creator: student.user)
        end

        before do
          submission.answers.update_all(grade: 5.0, current_answer: true)
          controller_sign_in(controller, ta.user)
        end

        it 'includes the assessment in the response' do
          subject
          data = JSON.parse(response.body)
          expect(data['assessments'].map { |a| a['id'] }).to include(assessment.id)
        end

        it 'includes the tab in the response' do
          subject
          data = JSON.parse(response.body)
          expect(data['tabs'].map { |t| t['id'] }).to include(tab.id)
        end

        it 'returns the correct grade for the student and assessment' do
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.id }
          expect(student_data['grades'][assessment.id.to_s].to_f).to eq(5.0)
        end

        it 'returns a positive maxGrade for the assessment' do
          subject
          data = JSON.parse(response.body)
          assessment_data = data['assessments'].find { |a| a['id'] == assessment.id }
          expect(assessment_data['maxGrade'].to_f).to be > 0
        end

        it 'returns correct totalGrade and totalMaxGrade' do
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.id }
          expect(student_data['totalGrade'].to_f).to eq(5.0)
          expect(student_data['totalMaxGrade'].to_f).to be > 0
        end
      end
    end
  end
end
