# frozen_string_literal: true
# Replaces an adopted copy's CONTENT with the version the marketplace currently serves, without
# replacing the assessment itself.
#
# The copy keeps its id and therefore its URL, its tab position, its published state, its unlock
# conditions and its adoption row. Only what the marketplace authored is overwritten. That is the
# difference between this and importing a fresh copy alongside: an instructor who has already put
# this assessment into their lesson plan keeps every local decision they made about it.
#
# DESTRUCTIVE and irreversible. Only ever reached through a gate that refuses when any non-phantom
# student of the course has a submission (`Course::Assessment#submission_counts_by_author`), and the
# controller re-checks that gate rather than trusting the client.
class Course::Assessment::Marketplace::ApplyVersionService
  # @param [Course::Assessment] assessment the adopter's own copy
  # @param [User] current_user
  # @return [Course::Assessment]
  def self.apply(assessment, current_user)
    new(assessment, current_user).apply
  end

  def initialize(assessment, current_user)
    @assessment = assessment
    @current_user = current_user
  end

  # @raise [ArgumentError] when the assessment is not a marketplace adoption, or its listing serves
  #   nothing to apply.
  # @return [Course::Assessment]
  def apply
    adoption = Course::Assessment::Marketplace::Adoption.
               find_by(duplicated_assessment_id: @assessment.id)
    raise ArgumentError, 'assessment was not adopted from the marketplace' if adoption.nil?

    # Read at EXECUTION time, never from the request: a version published between page load and
    # click must be the one applied, not the stale one the banner named.
    version = ActsAsTenant.without_tenant { adoption.listing.current_version }
    raise ArgumentError, 'listing has no current version' if version.nil?

    User.with_stamper(@current_user) do
      Course::Assessment.transaction do
        # Serialises two managers clicking at once; the loser applies to already-replaced content,
        # which is idempotent, rather than interleaving with the winner's destroys.
        @assessment.with_lock do
          ensure_no_student_submissions!
          transplant!(version)
        end
      end
    end

    @assessment
  end

  private

  def ensure_no_student_submissions!
    return if @assessment.submission_counts_by_author[:student] == 0

    raise ArgumentError, 'students have already submitted work for this assessment'
  end

  def transplant!(version)
    temp = duplicate_snapshot(version)
    clear_existing_content!
    adopt_content!(temp)
    copy_attributes!(temp, version)
    temp.destroy!
    advance_adoption!(version)
  end

  # The snapshot lives in the container course, which sits in the preview instance — never the
  # caller's — so the read and the duplication both run without a tenant.
  # @return [Course::Assessment] a throwaway copy in the destination course
  def duplicate_snapshot(version)
    ActsAsTenant.without_tenant do
      snapshot = version.assessment
      copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
        snapshot.course, @assessment.course, snapshot, current_user: @current_user
      )
      # No detach needed: this crosses out of the preview instance, and `#initialize_duplicate` drops
      # links that would span the boundary. The duplication root is kept on purpose.
      copy
    end
  end

  # ORDER IS LOAD-BEARING.
  #
  # Submissions first: answers carry a `question_id` FK, so questions cannot be deleted while any
  # answer references them. This is the same reason `Course::Assessment` declares `has_many
  # :submissions` above `:questions`.
  #
  # Then the join rows, then the questions themselves — `questions` is a `has_many through`, so
  # destroying the joins alone would leave orphaned Question rows behind forever.
  #
  # Personal times last: they were computed against the schedule this update is about to overwrite.
  # `Course::LessonPlan::Item#find_or_create_personal_time_for` rebuilds them on demand from the new
  # reference times, so removing them is a reset, not data loss.
  def clear_existing_content!
    @assessment.submissions.destroy_all

    questions = @assessment.questions.to_a
    @assessment.question_assessments.destroy_all
    questions.each(&:destroy!)

    @assessment.folder.materials.destroy_all
    @assessment.lesson_plan_item.personal_times.destroy_all
  end

  # Reparents the throwaway's content onto the surviving row rather than re-duplicating it, so the
  # questions the duplicator just built are used exactly once.
  def adopt_content!(temp)
    Course::QuestionAssessment.where(assessment_id: temp.id).
      update_all(assessment_id: @assessment.id)
    Course::Material.where(folder_id: temp.folder.id).
      update_all(folder_id: @assessment.folder.id)
    temp.question_assessments.reset
    temp.folder.materials.reset
  end

  # Everything the marketplace authored, and nothing the adopting course owns.
  #
  # Times arrive already shifted by `ObjectDuplicationService`'s `time_shift`, so the result matches
  # what a fresh import into this same course would have produced.
  #
  # `published` and `tab_id` are deliberately absent: replacing content must not silently expose or
  # hide an assessment, nor move it out from under the manager who filed it. Unlock conditions and
  # link-tree membership are untouched for a stronger reason — they reference this course's objects,
  # so the snapshot's would be meaningless.
  # rubocop:disable Metrics/AbcSize
  def copy_attributes!(temp, version)
    @assessment.title = resolved_title(temp.title, version)
    @assessment.description = temp.description
    @assessment.start_at = temp.start_at
    @assessment.end_at = temp.end_at
    @assessment.bonus_end_at = temp.bonus_end_at
    @assessment.base_exp = temp.base_exp
    @assessment.time_bonus_exp = temp.time_bonus_exp
    @assessment.autograded = temp.autograded
    @assessment.tabbed_view = temp.tabbed_view
    @assessment.delayed_grade_publication = temp.delayed_grade_publication
    @assessment.view_password = temp.view_password
    @assessment.session_password = temp.session_password
    @assessment.has_personal_times = temp.has_personal_times
    @assessment.affects_personal_times = temp.affects_personal_times
    @assessment.save!
  end
  # rubocop:enable Metrics/AbcSize

  # Collision rule excluding this assessment itself. Its own old title is exactly what it
  # is replacing, so it must not count as a collision.
  def resolved_title(new_title, version)
    taken = Course::Assessment.titles_in_course(@assessment.course, except_id: @assessment.id)
    temporary_title_index = taken.index(new_title.downcase)
    taken.delete_at(temporary_title_index) if temporary_title_index
    return new_title if taken.exclude?(new_title.downcase)

    dated = "#{new_title} [#{version.published_at.strftime('%d %b %Y')}]"
    candidate = dated

    suffix_number = 2
    while taken.include?(candidate.downcase)
      candidate = "#{dated} (#{suffix_number})"
      suffix_number += 1
    end

    candidate
  end

  def advance_adoption!(version)
    adoption = Course::Assessment::Marketplace::Adoption.
               find_by(duplicated_assessment_id: @assessment.id)
    # Restamping the vintage is the ONLY thing that retires the update banner: it is a fact about
    # the copy, not a notification, so there is nothing else to clear.
    adoption.update!(adopted_version_at: version.published_at)
  end
end
