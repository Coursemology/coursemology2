# frozen_string_literal: true
module Course::Assessment::QuestionBundleAssignmentConcern
  extend ActiveSupport::Concern

  # Computations on a large set of QBAs are expensive, and we need a lean in-memory representation of a set of QBAs.
  #
  # An AssignmentSet is a (thin) abstraction over a set of QBAs for an assessment which assumes consistency of the
  # underlying data. The constructing code is responsible for data translation / validation.
  #
  # Essentially a nested hash of Student -> Group -> Bundle. Group is nil if assigned bundle is extraneous. Everything
  # is identified by an integer ID.
  class AssignmentSet
    attr_accessor :assignments

    def initialize(students, group_bundles)
      @assignments = students.map { |x| [x, { nil => [] }] }.to_h
      @group_bundles = group_bundles
      @group_bundles_lookup = group_bundles.flat_map do |group, bundles|
        bundles.map { |bundle| [bundle, group] }
      end.to_h
    end

    def add_assignment(student, bundle)
      group = @group_bundles_lookup[bundle]
      @assignments[student] ||= { nil => [] }
      if @assignments[student][group].nil?
        @assignments[student][group] = bundle
      else
        @assignments[student][nil].append(bundle)
      end
    end
  end

  class AssignmentRandomizer
    def initialize(assessment)
      @assessment = assessment
      @students = assessment.course.user_ids
      @group_bundles = assessment.question_group_ids.map { |x| [x, []] }.to_h
      assessment.question_bundles.each { |bundle| @group_bundles[bundle.group_id].append(bundle.id) }
    end

    def load
      AssignmentSet.new(@students, @group_bundles).tap do |assignment_set|
        @assessment.question_bundle_assignments.where(submission: nil).each do |qba|
          assignment_set.add_assignment(qba.user_id, qba.bundle_id)
        end
      end
    end

    def save(assignment_set)
      # Deletion must be done atomically to prevent race conditions
      @assessment.question_bundle_assignments.where(submission: nil).delete_all
      new_question_bundle_assignments = []
      assignment_set.assignments.each do |student_id, assigned_group_bundles|
        assigned_group_bundles.each do |group_id, bundle_id|
          next if group_id.nil? || bundle_id.nil?

          new_question_bundle_assignments << Course::Assessment::QuestionBundleAssignment.new(
            user_id: student_id,
            assessment_id: @assessment.id,
            bundle_id: bundle_id
          )
        end
      end
      Course::Assessment::QuestionBundleAssignment.import! new_question_bundle_assignments
    end

    def randomize
      # Naive strategy: For each group, add a random bundle
      AssignmentSet.new(@students, @group_bundles).tap do |assignment_set|
        @students.each do |student|
          @group_bundles.each do |_, bundles|
            assignment_set.add_assignment(student, bundles.sample)
          end
        end
      end
    end
  end
end
