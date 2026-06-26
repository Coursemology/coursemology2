# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExternalAssessmentImportsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:manager) { create(:course_manager, course: course) }
    let(:ta) { create(:course_teaching_assistant, course: course) }
    let!(:alice) { create(:course_student, course: course, external_id: 'A001') }
    let!(:bob) { create(:course_student, course: course, external_id: 'A002') }

    let(:components) { [name: 'Midterm', weightage: 30, maximumGrade: 50] }
    let(:csv_data) { "External ID,Midterm\nA001,41\n" }
    let(:base_params) do
      { course_id: course.id, format: :json,
        components: components, identifierMode: 'student_id', csvData: csv_data }
    end

    describe '#preview' do
      render_views
      context 'as a manager' do
        before { controller_sign_in(controller, manager.user) }

        it 'returns ok with a sample and writes nothing' do
          expect { post :preview, params: base_params }.
            not_to(change { Course::ExternalAssessmentGrade.count })
          data = JSON.parse(response.body)
          expect(data['ok']).to be(true)
          expect(data['sample'].first['identifier']).to eq('A001')
        end

        it 'returns ok:false with unresolved identifiers' do
          post :preview, params: base_params.merge(csvData: "External ID,Midterm\nZZZ,1\n")
          data = JSON.parse(response.body)
          expect(data['ok']).to be(false)
          expect(data['unresolved']).to include('ZZZ')
        end

        it 'returns 422 on a malformed header' do
          post :preview, params: base_params.merge(csvData: "Wrong,Midterm\nA001,1\n")
          expect(response).to have_http_status(:unprocessable_entity)
          expect(JSON.parse(response.body)['errors']['message']).to eq('bad_header')
        end

        it 'returns conflicts when a grade already exists' do
          # Seed an existing grade for alice
          service = Course::Gradebook::ExternalAssessmentImportService.new(
            course: course, actor: manager.user,
            components: [name: 'Midterm', weightage: 30, maximum_grade: 50],
            identifier_mode: 'student_id', csv_data: "External ID,Midterm\nA001,10\n"
          )
          service.commit(on_conflict: 'replace')

          post :preview, params: base_params.merge(csvData: "External ID,Midterm\nA001,20\n")
          data = JSON.parse(response.body)
          expect(data['conflictRows'].size).to eq(1)
          expect(data['conflictRows'].first['studentName']).to eq(alice.name)
        end

        it 'returns ok:false with malformed grade cells' do
          post :preview, params: base_params.merge(csvData: "External ID,Midterm\nA001,oops\n")
          data = JSON.parse(response.body)
          expect(data['ok']).to be(false)
          expect(data['malformed']).to be_present
        end

        it 'returns 422 on duplicate component names' do
          dup_components = [{ name: 'Midterm', weightage: 30, maximumGrade: 50 },
                            { name: 'Midterm', weightage: 20, maximumGrade: 40 }]
          post :preview, params: base_params.merge(
            components: dup_components,
            csvData: "External ID,Midterm,Midterm\nA001,1,2\n"
          )
          expect(JSON.parse(response.body)['errors']['message']).to eq('duplicate_component_name')
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns out-of-range cells in the preview payload' do
          out_of_range_params = base_params.merge(
            components: [name: 'Midterm', weightage: 30, maximumGrade: 50],
            csvData: "External ID,Midterm\nA001,105\n"
          )
          post :preview, params: out_of_range_params, format: :json
          body = JSON.parse(response.body)
          expect(body['outOfRange']).to be_present
        end

        it 'resolves by email when identifierMode is email' do
          post :preview, params: base_params.merge(
            identifierMode: 'email',
            csvData: "Email,Midterm\n#{alice.user.email},41\n"
          )
          data = JSON.parse(response.body)
          expect(data['ok']).to be(true)
          expect(data['sample'].first['identifier']).to eq(alice.user.email)
        end
      end

      context 'as a teaching assistant' do
        before { controller_sign_in(controller, ta.user) }

        it 'is denied' do
          expect { post :preview, params: base_params }.to raise_error(CanCan::AccessDenied)
        end
      end
    end

    describe '#create (commit)' do
      render_views
      context 'as a manager' do
        before { controller_sign_in(controller, manager.user) }

        it 'commits and returns a summary' do
          expect { post :create, params: base_params.merge(onConflict: 'replace') }.
            to change { Course::ExternalAssessmentGrade.count }.by(1)
          data = JSON.parse(response.body)
          expect(data['createdComponents']).to eq(1)
          expect(data['gradesWritten']).to eq(1)
        end

        it 'returns 422 and writes nothing on an unresolved identifier' do
          expect do
            post :create, params: base_params.merge(
              csvData: "External ID,Midterm\nZZZ,1\n", onConflict: 'replace'
            )
          end.not_to(change { Course::ExternalAssessmentGrade.count })
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'commits with onConflict keep and returns updatedComponents' do
          # Seed first
          post :create, params: base_params.merge(onConflict: 'replace')
          # Re-import with keep
          expect do
            post :create, params: base_params.merge(onConflict: 'keep',
                                                    csvData: "External ID,Midterm\nA001,99\n")
          end.not_to(change { Course::ExternalAssessmentGrade.count })
          data = JSON.parse(response.body)
          expect(data['updatedComponents']).to eq(1)
          expect(data['createdComponents']).to eq(0)
          kept = Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm').
                 external_assessment_grades.find_by(course_user: alice)
          expect(kept.grade).to eq(41)
        end

        it 'overwrites an existing grade when onConflict is replace' do
          post :create, params: base_params.merge(onConflict: 'replace')
          post :create, params: base_params.merge(onConflict: 'replace',
                                                   csvData: "External ID,Midterm\nA001,99\n")
          data = JSON.parse(response.body)
          expect(data['updatedComponents']).to eq(1)
          expect(data['createdComponents']).to eq(0)
          grade = Course::ExternalAssessmentGrade.
                  joins(:external_assessment).
                  find_by(course_externalassessments: { course_id: course.id },
                          course_user_id: alice.id)
          expect(grade.grade).to eq(99)
        end

        it 'returns 422 on duplicate component names' do
          dup_components = [{ name: 'Midterm', weightage: 30, maximumGrade: 50 },
                            { name: 'Midterm', weightage: 20, maximumGrade: 40 }]
          expect do
            post :create, params: base_params.merge(
              components: dup_components,
              csvData: "External ID,Midterm,Midterm\nA001,1,2\n",
              onConflict: 'replace'
            )
          end.not_to(change { Course::ExternalAssessmentGrade.count })
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns 422 and writes nothing on malformed grade cells' do
          expect do
            post :create, params: base_params.merge(
              csvData: "External ID,Midterm\nA001,oops\n", onConflict: 'replace'
            )
          end.not_to(change { Course::ExternalAssessmentGrade.count })
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context 'as a teaching assistant' do
        before { controller_sign_in(controller, ta.user) }

        it 'is denied' do
          expect { post :create, params: base_params.merge(onConflict: 'keep') }.
            to raise_error(CanCan::AccessDenied)
        end
      end
    end
  end
end
