# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::QuestionsController, type: :controller do
  render_views

  let(:source_instance) { create(:instance) }
  let(:destination_instance) { create(:instance) }

  # Source-side data lives in the source instance. The listing is cross-instance, so it is built
  # with the tenant switched off — mirroring the controller's own without_tenant reads. These are
  # outer-level lets: they run before with_tenant sets the destination tenant, and they don't rely
  # on an ambient tenant because each sets its own explicitly.
  let!(:source_assessment) do
    ActsAsTenant.with_tenant(source_instance) do
      course = create(:course, instance: source_instance)
      assessment = create(:assessment, course: course)
      create(:course_assessment_question_multiple_response, :multiple_choice, assessment: assessment)
      assessment
    end
  end
  let!(:listing) do
    # NOTE: the factory has no :published trait — `published { true }` is a default attribute
    # (spec/factories/course_assessment_marketplace_listings.rb). Do NOT pass `:published`.
    ActsAsTenant.without_tenant do
      create(:course_assessment_marketplace_listing, assessment: source_assessment)
    end
  end
  let(:question) { source_assessment.questions.first }

  # Destination-side data + the request run under the destination tenant. with_tenant (controller
  # variant) sets ActsAsTenant.current_tenant AND the request host, so every tenant-scoped create
  # below (Course, CourseUser) and the controller's own tenant deduction resolve to the destination.
  with_tenant(:destination_instance) do
    let(:destination_course) { create(:course) }
    let(:manager) { create(:course_manager, course: destination_course).user }

    before do
      create(:course_assessment_marketplace_allowlist_rule, rule_type: :user, user: manager)
      controller_sign_in(controller, manager)
    end

    it 'serializes the question across instances' do
      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body['id']).to eq(question.id)
      expect(body['type']).to eq('MultipleResponse')
      expect(body['detail']).to be_present
    end

    it 'denies when the listing is unpublished' do
      ActsAsTenant.without_tenant { listing.update!(published: false) }
      expect do
        get :show, as: :json, params: {
          course_id: destination_course.id, listing_id: listing.id, id: question.id
        }
      end.to raise_exception(CanCan::AccessDenied)
    end

    it 'serializes the MCQ answer key (options with correctness, explanation, weight)' do
      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      detail = response.parsed_body['detail']
      expect(detail['gradingScheme']).to be_present
      expect(detail['options'].first).to include('option', 'correct', 'explanation', 'weight')
    end

    it 'serializes programming template files and test-case buckets' do
      question = nil
      listing = ActsAsTenant.with_tenant(source_instance) do
        assessment = create(:assessment, course: create(:course, instance: source_instance))
        create(
          :course_assessment_question_programming,
          assessment: assessment,
          test_case_count: 1,
          private_test_case_count: 1,
          evaluation_test_case_count: 1
        )
        question = assessment.questions.first
        ActsAsTenant.without_tenant do
          create(:course_assessment_marketplace_listing, assessment: assessment)
        end
      end

      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      detail = response.parsed_body['detail']
      expect(detail['languageName']).to be_present
      expect(detail['templateFiles']).to be_present
      expect(detail['publicTestCases'].first).to include('expression', 'expected', 'hint')
    end

    it 'serializes text-response solutions and attachment settings' do
      question = nil
      listing = ActsAsTenant.with_tenant(source_instance) do
        assessment = create(:assessment, course: create(:course, instance: source_instance))
        create(:course_assessment_question_text_response, :exact_match_solution, assessment: assessment)
        question = assessment.questions.first
        ActsAsTenant.without_tenant do
          create(:course_assessment_marketplace_listing, assessment: assessment)
        end
      end

      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      detail = response.parsed_body['detail']
      expect(detail).to include('hideText', 'isAttachmentRequired', 'maxAttachments', 'isComprehension')
      expect(detail['solutions'].first).to include('solution', 'grade')
    end

    it 'serializes rubric categories and criteria' do
      question = nil
      listing = ActsAsTenant.with_tenant(source_instance) do
        assessment = create(:assessment, course: create(:course, instance: source_instance))
        create(:course_assessment_question_rubric_based_response, assessment: assessment)
        question = assessment.questions.first
        ActsAsTenant.without_tenant do
          create(:course_assessment_marketplace_listing, assessment: assessment)
        end
      end

      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      category = response.parsed_body['detail']['categories'].first
      expect(category).to include('name', 'isBonus')
      expect(category['criteria'].first).to include('grade', 'explanation')
    end

    it 'serializes forum post requirements' do
      question = nil
      listing = ActsAsTenant.with_tenant(source_instance) do
        assessment = create(:assessment, course: create(:course, instance: source_instance))
        create(:course_assessment_question_forum_post_response, assessment: assessment)
        question = assessment.questions.first
        ActsAsTenant.without_tenant do
          create(:course_assessment_marketplace_listing, assessment: assessment)
        end
      end

      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      expect(response.parsed_body['detail']).to include('maxPosts', 'hasTextResponse')
    end

    it 'serializes voice response with an empty detail object' do
      question = nil
      listing = ActsAsTenant.with_tenant(source_instance) do
        assessment = create(:assessment, course: create(:course, instance: source_instance))
        create(:course_assessment_question_voice_response, assessment: assessment)
        question = assessment.questions.first
        ActsAsTenant.without_tenant do
          create(:course_assessment_marketplace_listing, assessment: assessment)
        end
      end

      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      expect(response.parsed_body['type']).to eq('VoiceResponse')
      expect(response.parsed_body['detail']).to eq({})
    end

    it 'serializes scribing with an imageUrl key (null when no attachment)' do
      question = nil
      listing = ActsAsTenant.with_tenant(source_instance) do
        assessment = create(:assessment, course: create(:course, instance: source_instance))
        create(:course_assessment_question_scribing, assessment: assessment)
        question = assessment.questions.first
        ActsAsTenant.without_tenant do
          create(:course_assessment_marketplace_listing, assessment: assessment)
        end
      end

      get :show, as: :json, params: {
        course_id: destination_course.id, listing_id: listing.id, id: question.id
      }
      expect(response.parsed_body['type']).to eq('Scribing')
      expect(response.parsed_body['detail']).to have_key('imageUrl')
      expect(response.parsed_body['detail']['imageUrl']).to be_nil
    end
  end
end
