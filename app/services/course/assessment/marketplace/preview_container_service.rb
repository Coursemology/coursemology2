# frozen_string_literal: true
# Provisions (idempotently) the single dedicated preview instance and the one content-frozen
# container course that backs the marketplace. Behaviour keys off `Course#preview`, never off a
# specific instance id.
#
# The container has one job with two faces: it stores every published version snapshot (see
# Course::Assessment::Marketplace::PublishService), and those same snapshots are what previewers
# attempt hands-on. They are deliberately the same rows — a snapshot IS the preview copy — so the
# marketplace can never preview content that differs from what a duplicate would give you.
#
# `Course#preview` is what makes that safe: the content-freeze in
# Course::AssessmentMarketplaceAbilityComponent#restrict_preview_course_content doubles as the
# previewer sandbox guard and as the snapshots' immutability guarantee. One flag, both needs.
class Course::Assessment::Marketplace::PreviewContainerService
  PREVIEW_INSTANCE_HOST = 'preview.coursemology.org'
  PREVIEW_INSTANCE_NAME = 'Marketplace Preview'
  PREVIEW_COURSE_TITLE = 'Marketplace Preview Sandbox'

  class << self
    # @return [Instance] the dedicated non-default preview instance.
    #
    # Note: `Instance#host` gsubs `coursemology.org` for the environment's default host (see
    # `Instance#host`), and Rails' hostname validation reads through that overridden accessor
    # rather than the raw column — so validating a `*.coursemology.org` host against a
    # `localhost:PORT` dev/test default host always fails on the injected colon. `db/seeds.rb`
    # hits the same problem for the default instance and works around it the same way:
    # `save!(validate: false)`.
    def preview_instance
      Instance.find_by(host: PREVIEW_INSTANCE_HOST) ||
        Instance.new(host: PREVIEW_INSTANCE_HOST, name: PREVIEW_INSTANCE_NAME).tap do |instance|
          instance.save!(validate: false)
        end
    end

    # @return [Course] the single `preview: true` container course in the preview instance.
    def container_course
      instance = preview_instance
      ActsAsTenant.with_tenant(instance) do
        Course.find_by(preview: true) || create_container_course(instance)
      end
    end

    private

    # `published/gamified/enrollable: false` keep the container out of every listing, level and
    # self-enrolment path: it holds the marketplace's snapshots, so it must never surface as a
    # course in its own right. Previewers are attached to it explicitly, one at a time.
    def create_container_course(instance)
      User.with_stamper(User.system) do
        Course.create!(
          instance: instance,
          title: PREVIEW_COURSE_TITLE,
          description: 'System container for marketplace version snapshots and hands-on previews.',
          preview: true,
          published: false,
          gamified: false,
          enrollable: false,
          creator: User.system,
          updater: User.system
        )
      end
    end
  end
end
