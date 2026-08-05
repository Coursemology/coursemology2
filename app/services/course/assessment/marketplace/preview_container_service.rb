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
      find_preview_instance || create_preview_instance
    end

    # Whether `instance` is the dedicated preview instance. The preview sandbox lock keys off this
    # rather than off `Course#preview`, because it also has to confine a previewer on the courseless
    # pages of this instance (`/courses`, `/role_requests`), where there is no course to read a flag
    # from. The container is the only course here, so the instance is the wider of two circles
    # that enclose the same content.
    #
    # Case-insensitive to match `find_preview_instance`: an instance that lookup resolves but this
    # predicate rejects would silently leave the sandbox lock disengaged.
    #
    # @param [Instance, nil] instance
    # @return [Boolean]
    def preview_instance?(instance)
      instance&.read_attribute(:host)&.downcase == PREVIEW_INSTANCE_HOST.downcase
    end

    # @return [Course] the container course in the preview instance.
    #
    # The flag alone is a unique key here: `index_courses_on_instance_id_one_preview` allows at most
    # one preview course per instance, so there is no second candidate to disambiguate against.
    def container_course
      instance = preview_instance
      ActsAsTenant.with_tenant(instance) do
        Course.find_by(preview: true) || create_container_course(instance)
      end
    end

    private

    def find_preview_instance
      Instance.where('lower(host) = ?', PREVIEW_INSTANCE_HOST.downcase).first
    end

    # `save!(validate: false)` skips the model's own uniqueness check as well as hostname validation
    # (see the note on this class), so the DB index is the only thing standing between two concurrent
    # callers. The loser re-reads rather than raising: provisioning is idempotent by contract.
    #
    # `requires_new: true` because a caller may already be in a transaction — the re-point runs in a
    # `before_destroy` — where a unique violation would abort the rescue's re-read along with it.
    def create_preview_instance
      ApplicationRecord.transaction(requires_new: true) do
        Instance.new(host: PREVIEW_INSTANCE_HOST, name: PREVIEW_INSTANCE_NAME).tap do |instance|
          instance.save!(validate: false)
        end
      end
    rescue ActiveRecord::RecordNotUnique
      find_preview_instance
    end

    # `published/gamified/enrollable: false` keep the container out of every listing, level and
    # self-enrolment path: it holds the marketplace's snapshots, so it must never surface as a
    # course in its own right. Previewers are attached to it explicitly, one at a time.
    #
    # Both rescues re-read for the reason `create_preview_instance` gives, and the savepoint for the
    # same reason: the model validation loses the race, the index settles it.
    def create_container_course(instance)
      ApplicationRecord.transaction(requires_new: true) do
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
    rescue ActiveRecord::RecordNotUnique
      Course.find_by!(preview: true)
    rescue ActiveRecord::RecordInvalid => e
      raise e if e.record.errors[:preview].empty?

      Course.find_by!(preview: true)
    end
  end
end
