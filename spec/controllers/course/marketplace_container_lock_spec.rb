# frozen_string_literal: true
require 'rails_helper'

# The container course is real and the previewer is a manager in it, so nothing but this guard stops
# them browsing it. Exercised through the three controllers that matter: the course home and the
# assessment index (both must be denied) and the submission page (allowed — but only for the caller's
# own preview copy).
RSpec.describe 'Marketplace container lock', type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:container) do
      Course::Assessment::Marketplace::ContainerCourseService.
        find_or_create!(instance: instance, creator: admin)
    end
    let(:previewer) { create(:user) }
    let(:course_user) do
      Course::Assessment::Marketplace::PreviewEnrolmentService.
        ensure_manager!(course: container, user: previewer)
    end
    let(:listing) do
      create(:course_assessment_marketplace_listing,
             assessment: create(:assessment, :published, :with_mcq_question,
                                course: create(:course, instance: instance)))
    end
    # The previewer's own preview copy, marker and all — exactly what the attempt endpoint provisions.
    let(:copy) do
      Course::Assessment::Marketplace::PreviewCopyService.
        copy!(listing: listing, container: container, course_user: course_user,
              current_user: previewer)
    end

    describe Course::CoursesController do
      render_views

      before { controller_sign_in(controller, previewer) }

      it 'denies the container course home to the enrolled previewer' do
        course_user # enrol

        expect do
          get :show, as: :json, params: { id: container.id }
        end.to raise_exception(CanCan::AccessDenied)
      end

      it 'still allows an ordinary course the user manages' do
        ordinary = create(:course, instance: instance)
        create(:course_manager, course: ordinary, user: previewer)

        get :show, as: :json, params: { id: ordinary.id }

        expect(response).to have_http_status(:ok)
      end

      # D49: nobody reaches the container in the UI — not even a system administrator, who otherwise
      # can open any course. Inspection is console-only. A guard that exempted admins would quietly
      # re-open the exact navigation surface this task exists to close.
      it 'denies the container course home even to a system administrator' do
        controller_sign_in(controller, admin)

        expect do
          get :show, as: :json, params: { id: container.id }
        end.to raise_exception(CanCan::AccessDenied)
      end
    end

    describe Course::Assessment::AssessmentsController do
      before { controller_sign_in(controller, previewer) }

      it "denies the container's assessment list to the enrolled previewer" do
        course_user

        expect do
          get :index, params: { course_id: container.id, format: :json }
        end.to raise_exception(CanCan::AccessDenied)
      end
    end

    describe Course::Assessment::Submission::SubmissionsController do
      # The guard's most dangerous failure mode is a false *positive*: the marketplace attempt action
      # redirects straight into submissions#create inside the container, so a guard that bounced this
      # would break the entire feature while every "denies" example below still passed.
      it 'allows the attempt hand-off that creates the preview submission' do
        controller_sign_in(controller, previewer)

        expect do
          post :create, params: { course_id: container.id, assessment_id: copy.id, format: :json }
        end.to change { copy.submissions.count }.by(1)

        expect(response).to have_http_status(:ok)
      end

      it "allows the previewer's own preview submission" do
        controller_sign_in(controller, previewer)
        submission = create(:submission, :attempting, assessment: copy,
                                                      course_user: course_user, creator: previewer)

        get :edit, params: { course_id: container.id, assessment_id: copy.id,
                             id: submission.id, format: :json }

        expect(response).to have_http_status(:ok)
      end

      # The ownership clause, not merely the "is it a preview copy" clause, is what stops one
      # previewer reading another's attempt — both are managers of the same container.
      it "denies another user's preview submission" do
        submission = create(:submission, :attempting, assessment: copy,
                                                      course_user: course_user, creator: previewer)
        intruder = create(:user)
        Course::Assessment::Marketplace::PreviewEnrolmentService.
          ensure_manager!(course: container, user: intruder)
        controller_sign_in(controller, intruder)

        expect do
          get :edit, params: { course_id: container.id, assessment_id: copy.id,
                               id: submission.id, format: :json }
        end.to raise_exception(CanCan::AccessDenied)
      end
    end
  end
end
