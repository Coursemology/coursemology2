# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExternalAssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:ta) { create(:course_teaching_assistant, course: course) }

    describe '#grades' do
      render_views
      let!(:external) { create(:course_external_assessment, course: course) }
      let(:gb_student) { create(:course_student, course: course) }

      context 'as a teaching assistant (grading-capable staff)' do
        before { controller_sign_in(controller, ta.user) }

        # The gradebook frontend keys students by user_id (json.studentId == course_user.user_id),
        # so #grades must resolve the course_user from the `studentId` param, not a course_user PK.
        it 'inserts a grade for a student who has none' do
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   studentId: gb_student.user_id, grade: 88 }
          end.to change { Course::ExternalAssessmentGrade.count }.by(1)
          expect(response).to be_successful
          data = JSON.parse(response.body)
          expect(data['studentId']).to eq(gb_student.user_id)
          expect(data['assessmentId']).to eq(-external.id)
          expect(data['grade']).to eq(88.0)
          expect(Course::ExternalAssessmentGrade.last.course_user).to eq(gb_student)
        end

        it 'updates an existing grade in place (no duplicate row)' do
          grade = create(:course_external_assessment_grade,
                         external_assessment: external, course_user: gb_student, grade: 10)
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   studentId: gb_student.user_id, grade: 20 }
          end.not_to(change { Course::ExternalAssessmentGrade.count })
          expect(grade.reload.grade).to eq(20)
        end

        it 'stores a grade with two decimal places without rounding' do
          put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                 studentId: gb_student.user_id, grade: '87.25' }
          expect(response).to be_successful
          expect(Course::ExternalAssessmentGrade.last.grade).to eq(BigDecimal('87.25'))
        end

        it 'clears a grade to null (ungraded) when grade is blank' do
          grade = create(:course_external_assessment_grade,
                         external_assessment: external, course_user: gb_student, grade: 10)
          put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                 studentId: gb_student.user_id, grade: '' }
          expect(grade.reload.grade).to be_nil
        end

        it 'returns 404 when the student does not belong to the course' do
          other_student = create(:course_student)
          put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                 studentId: other_student.user_id, grade: 50 }
          expect(response).to have_http_status(:not_found)
        end
      end

      context 'as a student' do
        let(:viewer) { create(:course_student, course: course) }
        before { controller_sign_in(controller, viewer.user) }

        it 'is denied' do
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   studentId: gb_student.user_id, grade: 5 }
          end.to raise_error(CanCan::AccessDenied)
        end
      end
    end
  end
end
