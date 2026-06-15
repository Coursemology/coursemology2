# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExternalAssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course) }
    let(:ta) { create(:course_teaching_assistant, course: course) }

    describe '#create' do
      render_views
      let(:params) do
        { course_id: course.id, format: :json, title: 'Final', maximumGrade: 100 }
      end

      context 'as a manager' do
        before { controller_sign_in(controller, manager.user) }

        it 'creates an external assessment with a contribution and no tab/category' do
          expect do
            post :create, params: params
          end.to change(Course::ExternalAssessment, :count).by(1).
            and change(Course::Gradebook::Contribution, :count).by(1).
            and not_change(Course::Assessment::Tab, :count)
          expect(response).to be_successful
          body = JSON.parse(response.body)
          created = Course::ExternalAssessment.last
          expect(body['assessment']['id']).to eq(-created.id)
          expect(body['assessment']['id']).to be < 0
          expect(body['assessment']['title']).to eq('Final')
          expect(body['assessment']['maxGrade']).to eq(100.0)
          expect(body['assessment']['external']).to be(true)
          expect(body['assessment']['gradebookExcluded']).to be(false)
          expect(body['tab']['id']).to eq(body['assessment']['tabId'])
          expect(body['tab']['id']).to be < 0
          expect(body['tab']['categoryId']).to eq(Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID)
          expect(body['category']['id']).to eq(Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID)
          expect(body['category']['title']).to eq(Course::ExternalAssessment::SYNTHETIC_CATEGORY_TITLE)
        end

        it 'returns 422 on a blank title' do
          post :create, params: params.merge(title: '')
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns 422 on a blank maximumGrade' do
          post :create, params: params.merge(maximumGrade: '')
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context 'as a teaching assistant' do
        before { controller_sign_in(controller, ta.user) }

        it 'is denied' do
          expect { post :create, params: params }.to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#update' do
      render_views
      let!(:external) { create(:course_external_assessment, course: course, title: 'Mid') }

      context 'as a manager' do
        before { controller_sign_in(controller, manager.user) }

        it 'renames and changes the maximum grade without touching any tab' do
          expect do
            patch :update, params: { course_id: course.id, id: external.id, format: :json,
                                     title: 'Midterm', maximumGrade: 60 }
          end.not_to change(Course::Assessment::Tab, :count)
          expect(response).to be_successful
          body = JSON.parse(response.body)
          expect(body['assessment']['id']).to eq(-external.id)
          expect(body['assessment']['title']).to eq('Midterm')
          expect(body['assessment']['maxGrade']).to eq(60.0)
          expect(body['assessment']['external']).to be(true)
          expect(body['assessment']['gradebookExcluded']).to be(false)
          expect(body['tab']['id']).to eq(-external.id)
          expect(body['tab']['title']).to eq('Midterm')
          expect(body['tab']['categoryId']).to eq(Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID)
          expect(external.reload.title).to eq('Midterm')
          expect(external.maximum_grade).to eq(60)
        end

        it 'returns 404 when the external belongs to another course' do
          other_external = create(:course_external_assessment)
          patch :update, params: { course_id: course.id, id: other_external.id, format: :json, title: 'X' }
          expect(response).to have_http_status(:not_found)
        end

        it 'returns 422 on a blank title' do
          patch :update, params: { course_id: course.id, id: external.id, format: :json,
                                   title: '' }
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context 'as a teaching assistant' do
        before { controller_sign_in(controller, ta.user) }

        it 'is denied' do
          expect do
            patch :update, params: { course_id: course.id, id: external.id, format: :json, title: 'X' }
          end.to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#destroy' do
      let!(:external) { create(:course_external_assessment, course: course) }

      context 'as a manager' do
        before { controller_sign_in(controller, manager.user) }

        it 'deletes the external and cascades grades' do
          create(:course_external_assessment_grade, external_assessment: external)
          expect do
            delete :destroy, params: { course_id: course.id, id: external.id, format: :json }
          end.to change { Course::ExternalAssessment.count }.by(-1).
            and change { Course::ExternalAssessmentGrade.count }.by(-1)
          expect(response).to be_successful
        end

        it 'returns 404 when the external belongs to another course' do
          other_external = create(:course_external_assessment)
          expect do
            delete :destroy, params: { course_id: course.id, id: other_external.id, format: :json }
          end.not_to(change { Course::ExternalAssessment.count })
          expect(response).to have_http_status(:not_found)
        end
      end

      context 'as a teaching assistant' do
        before { controller_sign_in(controller, ta.user) }

        it 'is denied' do
          expect { delete :destroy, params: { course_id: course.id, id: external.id, format: :json } }.
            to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#grades' do
      render_views
      let!(:external) { create(:course_external_assessment, course: course) }
      let(:gb_student) { create(:course_student, course: course) }

      context 'as a teaching assistant (grading-capable staff)' do
        before { controller_sign_in(controller, ta.user) }

        it 'inserts a grade for a student who has none' do
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   courseUserId: gb_student.id, grade: 88 }
          end.to change { Course::ExternalAssessmentGrade.count }.by(1)
          expect(response).to be_successful
          data = JSON.parse(response.body)
          expect(data['studentId']).to eq(gb_student.user_id)
          expect(data['assessmentId']).to eq(-external.id)
          expect(data['grade']).to eq(88.0)
        end

        it 'updates an existing grade in place (no duplicate row)' do
          grade = create(:course_external_assessment_grade,
                         external_assessment: external, course_user: gb_student, grade: 10)
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   courseUserId: gb_student.id, grade: 20 }
          end.not_to(change { Course::ExternalAssessmentGrade.count })
          expect(grade.reload.grade).to eq(20)
        end

        it 'clears a grade to null (ungraded) when grade is blank' do
          grade = create(:course_external_assessment_grade,
                         external_assessment: external, course_user: gb_student, grade: 10)
          put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                 courseUserId: gb_student.id, grade: '' }
          expect(grade.reload.grade).to be_nil
        end

        it 'returns 404 when the courseUserId does not belong to the course' do
          other_student = create(:course_student)
          put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                 courseUserId: other_student.id, grade: 50 }
          expect(response).to have_http_status(:not_found)
        end
      end

      context 'as a student' do
        let(:viewer) { create(:course_student, course: course) }
        before { controller_sign_in(controller, viewer.user) }

        it 'is denied' do
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   courseUserId: gb_student.id, grade: 5 }
          end.to raise_error(CanCan::AccessDenied)
        end
      end
    end
  end
end
