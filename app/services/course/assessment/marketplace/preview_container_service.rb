# frozen_string_literal: true
# Provisions (idempotently) the single dedicated preview instance and the one content-frozen
# container course that backs the marketplace. Behaviour keys off `Course#preview`, never off a
# specific instance id.
#
# The container stores every published version snapshot (see PublishService), and those same rows are
# what previewers attempt hands-on — a snapshot is the preview copy, so a preview can never differ
# from what a duplicate gives you. The content-freeze in AssessmentMarketplaceAbilityComponent then
# doubles as both the previewer sandbox guard and the snapshots' immutability guarantee.
class Course::Assessment::Marketplace::PreviewContainerService
  PREVIEW_INSTANCE_HOST = 'preview.coursemology.org'
  PREVIEW_INSTANCE_NAME = 'Marketplace Preview'
  PREVIEW_COURSE_TITLE = 'Marketplace Preview Sandbox'

  class << self
    # @return [Instance] the dedicated non-default preview instance.
    #
    # `save!(validate: false)` because `Instance#host` gsubs `coursemology.org` for the environment's
    # default host, and hostname validation reads through that overridden accessor rather than the raw
    # column — so a `*.coursemology.org` host validated against a `localhost:PORT` dev/test default
    # always fails on the injected colon. `db/seeds.rb` works around it the same way.
    def preview_instance
      Instance.find_by(host: PREVIEW_INSTANCE_HOST) ||
        Instance.new(host: PREVIEW_INSTANCE_HOST, name: PREVIEW_INSTANCE_NAME).tap do |instance|
          instance.save!(validate: false)
        end
    end

    # Whether `instance` is the dedicated preview instance. The preview sandbox lock keys off this
    # rather than off `Course#preview`, because it also has to confine a previewer on the courseless
    # pages of this instance (`/courses`, `/role_requests`), where there is no course to read a flag
    # from — and the container is the only course here, so the instance is the wider of two circles
    # that enclose the same content.
    #
    # Compares the raw column, not `Instance#host`: that accessor rewrites `coursemology.org` to the
    # environment's default host (see `preview_instance`), so in development the preview tenant reads
    # back as `preview.lvh.me:8080`. `preview_instance` looks the row up by the raw value too.
    #
    # @param [Instance, nil] instance
    # @return [Boolean]
    def preview_instance?(instance)
      instance&.read_attribute(:host) == PREVIEW_INSTANCE_HOST
    end

    # @return [Course] the single `preview: true` container course in the preview instance.
    def container_course
      instance = preview_instance
      ActsAsTenant.with_tenant(instance) do
        Course.find_by(preview: true) || create_container_course(instance)
      end
    end

    private

    # The description is the explainer rendered on this course's home page (see `CourseShow`), which
    # is otherwise blank: the sandbox has no announcements, todos or activity of its own. Its audience
    # is now the administrators who curate the container — `ApplicationPreviewSandboxConcern` keeps
    # previewers off the home page, and `PreviewCourseBanner` tells them the same thing on the
    # submission page they are actually landed on. Pinned to `:en` like `Course::Mailer#invite`,
    # because the container is a cross-instance singleton and its column can only ever hold one
    # language — whoever happens to trigger creation must not be the one who decides which.
    #
    # `published/gamified/enrollable: false` keep the container out of every listing, level and
    # self-enrolment path: it holds the marketplace's snapshots, so it must never surface as a
    # course in its own right. Previewers are attached to it explicitly, one at a time.
    def create_container_course(instance)
      description = I18n.with_locale(:en) do
        I18n.t('course.assessment.marketplace.preview_container.description_html')
      end

      User.with_stamper(User.system) do
        Course.create!(
          instance: instance,
          title: PREVIEW_COURSE_TITLE,
          description: description,
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
