# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ProgrammingUpgrade::QuestionsController, type: :controller do
  let(:instance) { Instance.default }

  # The jbuilder views are part of what this spec is checking, so render them.
  render_views

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:user) { create(:course_manager, course: course).user }
    let(:assessment) { create(:assessment, course: course) }
    let(:py9) { Coursemology::Polyglot::Language::Python::Python3Point9.instance }
    let(:py12) { Coursemology::Polyglot::Language::Python::Python3Point12.instance }
    let!(:question) do
      create(:course_assessment_question_programming,
             assessment: assessment, language: py9, template_package: true)
    end

    before { controller_sign_in(controller, user) }

    describe 'GET #index' do
      subject { get :index, as: :json, params: { course_id: course } }

      it 'lists the course programming questions with their upgrade targets' do
        expect(subject).to have_http_status(:success)

        body = JSON.parse(response.body)
        row = body['questions'].find { |q| q['id'] == question.id }
        languages = body['languages'].index_by { |l| l['id'] }

        expect(languages[row['languageId']]['name']).to eq('Python 3.9')
        expect(row['upgradable']).to be(true)
        expect(languages[row['upgradeTargetIds'].first]['name']).
          to eq(question.language.latest_in_family.name)
        expect(row['assessment']['id']).to eq(assessment.id)
        expect(row['upgrade']).to be_nil
      end

      # Languages are sent once and referenced by id, so a row must never carry a full language object.
      it 'does not repeat language objects on each row' do
        subject
        row = JSON.parse(response.body)['questions'].first

        expect(row).not_to have_key('language')
        expect(row).not_to have_key('upgradeTargets')
      end

      # Resolving targets per row would reload the whole language table once per question.
      it 'resolves upgrade targets for every row in one query' do
        create(:course_assessment_question_programming,
               assessment: assessment, language: py9, template_package: true)

        queries = 0
        counter = ->(_, _, _, _, payload) { queries += 1 if payload[:sql] =~ /FROM "polyglot_languages"/ }
        ActiveSupport::Notifications.subscribed(counter, 'sql.active_record') { subject }

        expect(queries).to be <= 2
      end
    end

    describe 'POST #create' do
      subject do
        post :create, as: :json,
                      params: { course_id: course, upgrades: { question.id.to_s => py12.id.to_s } }
      end

      it 'upgrades the question and returns the new upgrade row' do
        expect(subject).to have_http_status(:accepted)
        expect(question.reload.language).to eq(py12)

        body = JSON.parse(response.body)
        expect(body['upgrades'].first['questionId']).to eq(question.id)
        expect(body['upgrades'].first['workflowState']).to eq('running')
        expect(body['rejected']).to be_empty
      end

      it 'reports a rejection without upgrading' do
        post :create, as: :json,
                      params: { course_id: course, upgrades: { question.id.to_s => py9.id.to_s } }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(question.reload.language).to eq(py9)
        expect(JSON.parse(response.body)['rejected']).to have_key(question.id.to_s)
      end
    end

    describe 'POST #revert' do
      it 'moves the question back to the language it was last good on' do
        post :create, as: :json,
                      params: { course_id: course, upgrades: { question.id.to_s => py12.id.to_s } }
        upgrade = question.reload.upgrade
        upgrade.fail!
        upgrade.save!

        post :revert, as: :json, params: { course_id: course, id: question.id }

        expect(response).to have_http_status(:accepted)
        expect(question.reload.language).to eq(py9)
      end
    end

    describe 'GET #upgrades' do
      it 'returns the current state of the requested questions' do
        post :create, as: :json,
                      params: { course_id: course, upgrades: { question.id.to_s => py12.id.to_s } }

        get :fetch_upgrades, as: :json, params: { course_id: course, question_ids: [question.id] }

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body)['upgrades'].first['questionId']).to eq(question.id)
      end
    end

    describe 'authorisation' do
      let(:student) { create(:course_student, course: course).user }

      it 'denies a student' do
        controller_sign_in(controller, student)
        expect { get :index, as: :json, params: { course_id: course } }.
          to raise_error(CanCan::AccessDenied)
      end
    end
  end
end
