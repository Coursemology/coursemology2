# frozen_string_literal: true
require 'rails_helper'

# The lock is one request-layer allow-list spanning many controllers, so it is specced in one file
# rather than smeared across each controller's own spec. What matters is the boundary itself: reading
# the allowed and denied surfaces side by side is the only way to see what a previewer can still
# reach, and a per-controller spec cannot say "and nothing else".
#
# This spec drives the REAL preview instance and container course, unlike the rest of the marketplace
# suite, which stands in a throwaway `create(:course, preview: true)`. It has to: the lock keys off
# the instance (a previewer must be confined on courseless pages too, where there is no course to
# read a flag from), so a stand-in course on some other instance would not trip it. Same call the
# production path makes, so the setup is `PublishService` + `PreviewLaunchService` rather than
# hand-built fixtures.
RSpec.shared_context 'marketplace preview sandbox' do
  let(:preview_instance) { Course::Assessment::Marketplace::PreviewContainerService.preview_instance }
  let(:container) do
    ActsAsTenant.without_tenant { Course::Assessment::Marketplace::PreviewContainerService.container_course }
  end
  let(:previewer) { ActsAsTenant.with_tenant(Instance.default) { create(:user) } }

  # Published from an ordinary course on the default instance, exactly as a real listing is: the
  # snapshot `PublishService` puts in the container is what a previewer is handed.
  let(:listing) do
    ActsAsTenant.with_tenant(Instance.default) do
      source = create(:assessment, course: create(:course))
      Course::Assessment::Marketplace::PublishService.publish(source, source.course.creator)
    end
  end
  let(:snapshot) { ActsAsTenant.without_tenant { listing.current_version.assessment } }

  # A container assessment no published listing serves — a superseded snapshot, a restored authoring
  # working copy, or the snapshot of a delisted listing all look like this. Container ids are
  # guessable, so reaching one must not depend on the index being hidden.
  let(:unserved_assessment) do
    ActsAsTenant.with_tenant(preview_instance) { create(:assessment, course: container) }
  end

  before { Course::Assessment::Marketplace::PreviewLaunchService.launch(listing, previewer) }
end

RSpec.describe Course::CoursesController, type: :controller do
  include_context 'marketplace preview sandbox'

  with_tenant(:preview_instance) do
    before { controller_sign_in(controller, previewer) }

    it 'denies the sandbox course home page' do
      expect { get :show, params: { id: container, format: :json } }.
        to raise_exception(CanCan::AccessDenied)
    end

    it 'denies the instance course index' do
      expect { get :index, format: :json }.to raise_exception(CanCan::AccessDenied)
    end

    # The layout payload is fetched on every course page, so denying it would take the submission
    # page down with it.
    it 'allows the sidebar' do
      get :sidebar, params: { id: container, format: :json }
      expect(response).to have_http_status(:success)
    end
  end
end

RSpec.describe Course::AnnouncementsController, type: :controller do
  include_context 'marketplace preview sandbox'

  with_tenant(:preview_instance) do
    before { controller_sign_in(controller, previewer) }

    # Stands in for every component page in the sandbox: lesson plan, materials, forums, surveys,
    # videos, comments, statistics. Announcements specifically, because it is one the ability
    # component never mentions — a previewer's `manager` role carries it outright, so it fails without
    # the lock. (The users page would pass either way: `cannot [:show_users, :manage_users]` already
    # covers the roster, and asserting it here would prove nothing about this gate.)
    it 'denies a component page nothing else revokes' do
      expect { get :index, params: { course_id: container, format: :json } }.
        to raise_exception(CanCan::AccessDenied)
    end
  end
end

RSpec.describe Course::Assessment::AssessmentsController, type: :controller do
  include_context 'marketplace preview sandbox'

  with_tenant(:preview_instance) do
    before { controller_sign_in(controller, previewer) }

    it 'denies the container assessment index' do
      expect { get :index, params: { course_id: container, format: :json } }.
        to raise_exception(CanCan::AccessDenied)
    end

    # The assessment page is not part of the preview flow, and for a `manager` — which every previewer
    # is — `show` serves the whole authoring surface: `canManage`, the question edit urls, the
    # new-question and generate-question urls, graded test case visibility. Only the breadcrumb needs
    # this endpoint, and only for a title.
    it 'denies the snapshot page' do
      expect { get :show, params: { course_id: container, id: snapshot, format: :json } }.
        to raise_exception(CanCan::AccessDenied)
    end

    # Both breadcrumb handles on the submission page fetch this endpoint, so it is load-bearing.
    it 'allows a breadcrumb request for the snapshot a published listing serves' do
      get :show, params: { course_id: container, id: snapshot, crumb: true, format: :json }
      expect(response).to have_http_status(:success)
    end

    it 'denies a breadcrumb request for a container assessment no published listing serves' do
      expect do
        get :show, params: { course_id: container, id: unserved_assessment, crumb: true, format: :json }
      end.to raise_exception(CanCan::AccessDenied)
    end
  end
end

# The lock must fire on the preview instance and nowhere else — the manager role it denies there is
# an ordinary one everywhere else. Deliberately outside the shared context: nothing about this needs
# the container to exist.
RSpec.describe Course::Assessment::AssessmentsController, 'outside the preview instance', type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:manager) { create(:course_manager, course: course) }

    before { controller_sign_in(controller, manager.user) }

    it 'leaves an ordinary course untouched' do
      get :index, params: { course_id: course, format: :json }
      expect(response).to have_http_status(:success)
    end
  end
end

RSpec.describe Course::Assessment::Submission::SubmissionsController, type: :controller do
  include_context 'marketplace preview sandbox'

  with_tenant(:preview_instance) do
    before { controller_sign_in(controller, previewer) }

    # `attempt` routes here. It mints the submission every later action is scoped to by `creator_id`,
    # so it is the one action that has to vet the assessment rather than ride on the submission.
    it 'allows attempting the snapshot a published listing serves' do
      get :create, params: { course_id: container, assessment_id: snapshot, format: :json }
      expect(response).to have_http_status(:success)
    end

    it 'refuses to mint a submission on a container assessment no published listing serves' do
      expect do
        get :create, params: { course_id: container, assessment_id: unserved_assessment, format: :json }
      end.to raise_exception(CanCan::AccessDenied)
    end

    # A manager's blanket `can :manage, Course::Assessment` satisfies `:publish_grades`, and no
    # `cannot` revokes it — this action would otherwise publish grades for every previewer's
    # submission on the snapshot.
    it 'denies publishing grades for the whole assessment' do
      expect do
        patch :publish_all, params: { course_id: container, assessment_id: snapshot, format: :json }
      end.to raise_exception(CanCan::AccessDenied)
    end
  end
end

RSpec.describe Course::Assessment::AssessmentsController, 'preview sandbox administrators', type: :controller do
  include_context 'marketplace preview sandbox'

  let(:administrator) { ActsAsTenant.with_tenant(Instance.default) { create(:administrator) } }

  with_tenant(:preview_instance) do
    before { controller_sign_in(controller, administrator) }

    # A system administrator curates the container from inside it, so the lock is per-viewer. Mirrors
    # the exemption in Course::AssessmentMarketplaceAbilityComponent#define_permissions.
    it 'is exempt from the lock' do
      get :index, params: { course_id: container, format: :json }
      expect(response).to have_http_status(:success)
    end
  end
end
