# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExternalAssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course) }
    let(:ta) { create(:course_teaching_assistant, course: course) }
    let(:observer) { create(:course_observer, course: course) }

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

        it 'serializes the bound flags' do
          post :create, as: :json, params: {
            course_id: course, title: 'Midterm', maximumGrade: 50
          }
          json = JSON.parse(response.body)
          expect(json['assessment']).to include('floorAtZero' => true, 'capAtMaximum' => true)
        end

        it 'persists explicit bound flags on create' do
          post :create, as: :json, params: {
            course_id: course, title: 'Bonus', maximumGrade: 10,
            floorAtZero: false, capAtMaximum: false
          }
          json = JSON.parse(response.body)
          expect(json['assessment']).to include('floorAtZero' => false, 'capAtMaximum' => false)
        end

        it 'persists a weight when weighted view is enabled' do
          context = OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
          Course::Settings::GradebookComponent.new(context).weighted_view_enabled = true
          course.save!

          post :create, as: :json, params: {
            course_id: course, title: 'Presentation', maximumGrade: 10,
            weight: 25
          }

          created = Course::ExternalAssessment.last
          json = JSON.parse(response.body)
          expect(created.gradebook_contribution.weight).to eq(25)
          expect(json['assessment']['gradebookWeight']).to eq(25.0)
          expect(json['tab']['gradebookWeight']).to eq(25.0)
        end

        it 'ignores a weight when weighted view is disabled' do
          post :create, as: :json, params: {
            course_id: course, title: 'Presentation', maximumGrade: 10,
            weight: 25
          }

          created = Course::ExternalAssessment.last
          json = JSON.parse(response.body)
          expect(created.gradebook_contribution.weight).to eq(0)
          expect(json['assessment']).not_to have_key('gradebookWeight')
          expect(json['tab']).not_to have_key('gradebookWeight')
        end

        it 'returns 422 on a blank title' do
          post :create, params: params.merge(title: '')
          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'returns 422 on a blank maximumGrade' do
          post :create, params: params.merge(maximumGrade: '')
          expect(response).to have_http_status(:unprocessable_content)
        end

        it "serializes the tab weightMode as 'equal' when weighted" do
          context = OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
          Course::Settings::GradebookComponent.new(context).weighted_view_enabled = true
          course.save!

          post :create, as: :json, params: {
            course_id: course, title: 'Presentation', maximumGrade: 10, weight: 25
          }
          json = JSON.parse(response.body)
          expect(json['tab']['weightMode']).to eq('equal')
        end
      end

      context 'as a teaching assistant' do
        before { controller_sign_in(controller, ta.user) }

        it 'is denied' do
          expect { post :create, params: params }.to raise_error(CanCan::AccessDenied)
        end
      end

      context 'as an observer' do
        before { controller_sign_in(controller, observer.user) }

        it 'is denied' do
          expect { post :create, params: params }.to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#update' do
      render_views
      let!(:external) { create(:course_external_assessment, course: course, title: 'Mid') }
      let(:gb_student) { create(:course_student, course: course) }

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

        it 'stores a maximum grade with two decimal places without rounding' do
          patch :update, params: { course_id: course.id, id: external.id, format: :json,
                                   maximumGrade: '99.25' }
          expect(response).to be_successful
          expect(external.reload.maximum_grade).to eq(BigDecimal('99.25'))
        end

        it 'returns 404 when the external belongs to another course' do
          other_external = create(:course_external_assessment)
          patch :update, params: { course_id: course.id, id: other_external.id, format: :json, title: 'X' }
          expect(response).to have_http_status(:not_found)
        end

        it 'returns 404 when grading an external that belongs to another course' do
          other_external = create(:course_external_assessment)
          put :grades, params: { course_id: course.id, id: other_external.id, format: :json,
                                 studentId: gb_student.user_id, grade: 50 }
          expect(response).to have_http_status(:not_found)
        end

        it 'returns 422 on a blank title' do
          patch :update, params: { course_id: course.id, id: external.id, format: :json,
                                   title: '' }
          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'updates a bound flag' do
          external = create(:course_external_assessment,
                            course: course, title: 'Quiz', maximum_grade: 20)
          patch :update, as: :json, params: {
            course_id: course, id: external.id, capAtMaximum: false
          }
          expect(external.reload.cap_at_maximum).to be(false)
          expect(external.floor_at_zero).to be(true)
        end

        context 'when weighted view is enabled' do
          let!(:weighted_external) do
            Course::ExternalAssessment.create_for_course!(
              course: course, title: 'Final', maximum_grade: 100, weight: 10
            )
          end

          before do
            context = OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
            Course::Settings::GradebookComponent.new(context).weighted_view_enabled = true
            course.save!
          end

          it 'updates the contribution weight and echoes it back' do
            patch :update, as: :json, params: {
              course_id: course, id: weighted_external.id, weight: 40
            }
            expect(response).to be_successful
            expect(weighted_external.gradebook_contribution.reload.weight).to eq(40)
            body = JSON.parse(response.body)
            expect(body['assessment']['gradebookWeight']).to eq(40.0)
            expect(body['tab']['gradebookWeight']).to eq(40.0)
          end

          it "serializes the tab weightMode as 'equal'" do
            patch :update, as: :json, params: {
              course_id: course, id: weighted_external.id, weight: 40
            }
            body = JSON.parse(response.body)
            expect(body['tab']['weightMode']).to eq('equal')
          end

          it 'leaves the contribution weight untouched when no weight param is sent' do
            patch :update, as: :json, params: {
              course_id: course, id: weighted_external.id, title: 'Renamed'
            }
            expect(response).to be_successful
            expect(weighted_external.gradebook_contribution.reload.weight).to eq(10)
          end
        end

        it 'ignores a weight when weighted view is disabled' do
          weighted_external = Course::ExternalAssessment.create_for_course!(
            course: course, title: 'Final', maximum_grade: 100, weight: 10
          )
          patch :update, as: :json, params: {
            course_id: course, id: weighted_external.id, weight: 40
          }
          expect(weighted_external.gradebook_contribution.reload.weight).to eq(10)
          body = JSON.parse(response.body)
          expect(body['assessment']).not_to have_key('gradebookWeight')
          expect(body['tab']).not_to have_key('gradebookWeight')
        end

        it 'inserts a grade for a student who has none' do
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   studentId: gb_student.user_id, grade: 70 }
          end.to change { Course::ExternalAssessmentGrade.count }.by(1)
          expect(response).to be_successful
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

      context 'as a manager' do
        before { controller_sign_in(controller, manager.user) }

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

      context 'as a teaching assistant' do
        before { controller_sign_in(controller, ta.user) }

        it 'is denied' do
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   studentId: gb_student.user_id, grade: 5 }
          end.to raise_error(CanCan::AccessDenied)
        end
      end

      context 'as an observer' do
        before { controller_sign_in(controller, observer.user) }

        it 'is denied' do
          expect do
            put :grades, params: { course_id: course.id, id: external.id, format: :json,
                                   studentId: gb_student.user_id, grade: 5 }
          end.to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#reorder' do
      let!(:a) { create(:course_external_assessment, course: course) }
      let!(:b) { create(:course_external_assessment, course: course) }
      let!(:c) { create(:course_external_assessment, course: course) }

      context 'as a manager' do
        before { controller_sign_in(controller, manager.user) }

        it 'rewrites positions to the given order' do
          put :reorder, params: { course_id: course.id, format: :json,
                                  orderedIds: [c.id, a.id, b.id] }
          expect(response).to have_http_status(:ok)
          expect([a.reload.position, b.reload.position, c.reload.position]).to eq([1, 2, 0])
        end

        it 'rejects a payload whose id set does not match' do
          put :reorder, params: { course_id: course.id, format: :json,
                                  orderedIds: [a.id, b.id] }
          expect(response).to have_http_status(:unprocessable_content)
        end
      end
    end
  end
end
