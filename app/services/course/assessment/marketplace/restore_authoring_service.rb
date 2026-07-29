# frozen_string_literal: true
# Gives a listing a fresh authoring copy by cloning its latest SNAPSHOT into the marketplace
# container, and points `authoring_assessment` at the clone.
#
# The listing MUST have a `current_version`: there is nothing else to clone from.
class Course::Assessment::Marketplace::RestoreAuthoringService
  # @param [Course::Assessment::Marketplace::Listing] listing
  # @param [User] current_user whoever the copy is stamped to — the system user for the automatic
  #   re-point, the acting admin for the repair action
  # @return [Course::Assessment] the new authoring copy
  def self.restore!(listing, current_user: User.system)
    new(listing, current_user).restore!
  end

  def initialize(listing, current_user)
    @listing = listing
    @current_user = current_user
  end

  # @return [Course::Assessment]
  def restore!
    ActsAsTenant.without_tenant do
      container = Course::Assessment::Marketplace::PreviewContainerService.container_course
      snapshot = @listing.current_version.assessment
      User.with_stamper(@current_user) do
        copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
          snapshot.course, container, snapshot, current_user: @current_user
        )
        @listing.update!(authoring_assessment: copy)
        copy
      end
    end
  end
end
