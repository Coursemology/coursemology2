# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GradebookController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_user, :student, course: course) }
    let(:staff) { create(:course_user, :teaching_assistant, course: course) }

    describe '#index' do
      render_views
      subject { get :index, params: { course_id: course.id }, format: :json }

      context 'when the gradebook component is disabled' do
        let(:ta) { create(:course_teaching_assistant, course: course) }

        before do
          controller_sign_in(controller, ta.user)
          allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
        end

        it 'raises a component not found error' do
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

        it 'returns all required top-level keys' do
          subject
          data = JSON.parse(response.body)
          %w[categories tabs assessments students submissions].each do |key|
            expect(data).to have_key(key), "expected response to have key '#{key}'"
          end
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

        it 'includes the assessment in the assessments array' do
          subject
          data = JSON.parse(response.body)
          expect(data['assessments'].map { |a| a['id'] }).to include(assessment.id)
        end

        it 'includes the tab in the tabs array' do
          subject
          data = JSON.parse(response.body)
          expect(data['tabs'].map { |t| t['id'] }).to include(tab.id)
        end

        it 'includes the category in the categories array' do
          subject
          data = JSON.parse(response.body)
          expect(data['categories'].map { |c| c['id'] }).to include(tab.category.id)
        end

        it 'includes the student with email and level in the students array' do
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.user_id }
          expect(student_data).not_to be_nil
          expect(student_data).to have_key('email')
          expect(student_data).to have_key('externalId')
          expect(student_data['externalId']).to be_nil
          expect(student_data).to have_key('level')
          expect(student_data['level']).to be_a(Integer)
        end

        it 'returns the correct grade in the submissions array' do
          subject
          data = JSON.parse(response.body)
          sub = data['submissions'].find do |s|
            s['studentId'] == student.user_id && s['assessmentId'] == assessment.id
          end
          expect(sub).not_to be_nil
          expect(sub['grade'].to_f).to eq(5.0)
        end

        it 'returns a positive maxGrade for the assessment' do
          subject
          data = JSON.parse(response.body)
          assessment_data = data['assessments'].find { |a| a['id'] == assessment.id }
          expect(assessment_data['maxGrade'].to_f).to be > 0
        end
      end

      context 'when a student has an external ID' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        let!(:student) { create(:course_student, course: course, external_id: 'EXT-123') }
        before { controller_sign_in(controller, ta.user) }

        it 'returns the external ID in the students array' do
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.user_id }
          expect(student_data).not_to be_nil
          expect(student_data['externalId']).to eq('EXT-123')
        end
      end


      context 'with a graded submission where the answer grade is exactly 0' do
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
          submission.answers.update_all(grade: 0.0, current_answer: true)
          controller_sign_in(controller, ta.user)
        end

        it 'returns grade 0 (not null) in the submissions array' do
          subject
          data = JSON.parse(response.body)
          sub = data['submissions'].find do |s|
            s['studentId'] == student.user_id && s['assessmentId'] == assessment.id
          end
          expect(sub).not_to be_nil
          expect(sub['grade']).to eq(0.0)
        end
      end

      context 'with a graded submission where answer grades are null (blank)' do
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
          submission.answers.update_all(grade: nil, current_answer: true)
          controller_sign_in(controller, ta.user)
        end

        it 'returns null grade (not 0) in the submissions array' do
          subject
          data = JSON.parse(response.body)
          sub = data['submissions'].find do |s|
            s['studentId'] == student.user_id && s['assessmentId'] == assessment.id
          end
          expect(sub).not_to be_nil
          expect(sub['grade']).to be_nil
        end
      end
    end
  end
end
