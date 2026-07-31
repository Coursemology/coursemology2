# frozen_string_literal: true
require 'rails_helper'

# The root payload is fetched on every page and is the only data the courseless navigation shell has,
# so it is where the preview sandbox lock reaches the surfaces that cannot read it off a course — the
# 404 page, which drops its "go back home" link when the flag is set.
#
# A separate file from `application_controller_spec.rb`: that spec defines an anonymous
# `controller do ... end`, which cannot render the real `application/index.json.jbuilder`.
#
# Drives the REAL preview instance rather than a stand-in `create(:course, preview: true)`, the same
# way `spec/controllers/course/assessment/marketplace/preview_sandbox_lock_spec.rb` does: the
# predicate keys off the instance precisely because a courseless page has no course to read a flag
# from, so a stand-in course elsewhere would not trip it.
RSpec.describe ApplicationController, 'root payload', type: :controller do
  render_views

  subject(:payload) do
    get :index, format: :json
    JSON.parse(response.body)
  end

  let(:preview_instance) { Course::Assessment::Marketplace::PreviewContainerService.preview_instance }
  let(:previewer) { ActsAsTenant.with_tenant(Instance.default) { create(:user) } }
  let(:listing) do
    ActsAsTenant.with_tenant(Instance.default) do
      source = create(:assessment, course: create(:course))
      Course::Assessment::Marketplace::PublishService.publish(source, source.course.creator)
    end
  end

  before { Course::Assessment::Marketplace::PreviewLaunchService.launch(listing, previewer) }

  context 'when on the preview instance' do
    with_tenant(:preview_instance) do
      context 'when the viewer is a previewer' do
        before { controller_sign_in(controller, previewer) }

        it 'reports the sandbox lock' do
          expect(payload['isPreviewRestricted']).to be(true)
        end
      end

      # The lock is per-viewer: a system administrator curates the container from inside it, so the
      # navigation shell stays whole for them. Mirrors the exemption in `preview_sandbox_locked?`.
      context 'when the viewer is a system administrator' do
        let(:administrator) { ActsAsTenant.with_tenant(Instance.default) { create(:administrator) } }

        before { controller_sign_in(controller, administrator) }

        it 'does not report the sandbox lock' do
          expect(payload['isPreviewRestricted']).to be(false)
        end
      end
    end
  end

  # Same previewer, ordinary instance: the lock is a property of where they are, not of who they are.
  context 'when outside the preview instance' do
    let(:instance) { Instance.default }

    with_tenant(:instance) do
      before { controller_sign_in(controller, previewer) }

      it 'does not report the sandbox lock' do
        expect(payload['isPreviewRestricted']).to be(false)
      end
    end
  end
end
