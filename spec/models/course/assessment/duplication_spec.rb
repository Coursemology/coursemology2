# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment, 'duplication' do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:ancestor_course) { create(:course) }
    let(:source_course) { create(:course) }

    describe '#initialize_duplicate' do
      context 'when duplicating assessments with links' do
        let!(:assessment_a) { create(:assessment, course: ancestor_course, start_at: Time.zone.now) }
        let!(:assessment_b) { create(:assessment, course: source_course, start_at: Time.zone.now) }
        let!(:assessment_c) { create(:assessment, course: source_course, start_at: Time.zone.now) }

        before do
          # Create links: B -> A, B -> C, C -> B
          Course::Assessment::Link.create!(assessment: assessment_b, linked_assessment: assessment_a)
          Course::Assessment::Link.create!(assessment: assessment_b, linked_assessment: assessment_c)
          Course::Assessment::Link.create!(assessment: assessment_c, linked_assessment: assessment_b)
        end

        context 'when duplicating a single assessment with linked assessments' do
          subject do
            duplicator = Duplicator.new([], {
              time_shift: 2.days,
              destination_course: source_course
            })
            duplicate_b = duplicator.duplicate(assessment_b)
            duplicate_b.save!
            duplicate_b
          end

          it 'preserves links to non-duplicated assessments' do
            # Should link to original B (where it was duplicated from), and inherit original A and C
            expect(subject.linked_assessments).to contain_exactly(assessment_a, assessment_b, assessment_c)
          end

          it 'inherits linkable_tree_id from original assessment' do
            expect(subject.id).to_not eq(assessment_b.id)
            expect(subject.linkable_tree_id).to eq(assessment_b.id)
          end
        end

        # A link that crosses an instance boundary must not survive duplication. Every later reader
        # resolves a link through `Course`, which is `acts_as_tenant :instance`, so such a row comes
        # back with a nil course: the next duplication dies in
        # `Course::LessonPlan::Item#link_default_reference_time` and a plagiarism run dies in
        # `Course::SsidFolderConcern#sync_assessment_ssid_folder`.
        context 'when a link crosses an instance boundary' do
          let(:other_instance) { create(:instance) }
          let!(:foreign_assessment) do
            ActsAsTenant.with_tenant(other_instance) do
              create(:assessment, course: create(:course), start_at: Time.zone.now)
            end
          end

          before do
            Course::Assessment::Link.create!(assessment: assessment_b,
                                             linked_assessment: foreign_assessment)
          end

          subject do
            duplicator = Duplicator.new([], {
              time_shift: 2.days,
              destination_course: source_course
            })
            duplicate_b = duplicator.duplicate(assessment_b)
            duplicate_b.save!
            duplicate_b
          end

          it 'drops the cross-instance link and keeps the same-instance ones' do
            expect(subject.linked_assessments).
              to contain_exactly(assessment_a, assessment_b, assessment_c)
          end

          it 'leaves the source assessment its own cross-instance link untouched' do
            subject
            expect(assessment_b.reload.linked_assessments).to include(foreign_assessment)
          end

          it 'still inherits linkable_tree_id' do
            expect(subject.linkable_tree_id).to eq(assessment_b.id)
          end
        end

        # `CourseDuplicationService#duplicate_course` accepts a `destination_instance_id`, so a course
        # can be moved to another instance. A lone assessment then arrives with no links at all.
        context 'when the destination course is in another instance' do
          let(:other_instance) { create(:instance) }
          let(:foreign_course) do
            ActsAsTenant.with_tenant(other_instance) { create(:course) }
          end

          # Tenant-free, mirroring `Course::DuplicationJob:14` — a cross-instance duplication cannot run
          # under either instance's tenant, because the conditional extension resolves the destination
          # course by id (`extensions/conditional/active_record/base.rb:105`). It also means the filter
          # reaches its verdict here by comparing two real `instance_id`s, where the context above
          # reaches the same verdict through a tenant-scoped nil.
          subject do
            ActsAsTenant.without_tenant do
              duplicator = Duplicator.new([], {
                time_shift: 2.days,
                destination_course: foreign_course
              })
              duplicate_b = duplicator.duplicate(assessment_b)
              duplicate_b.save!
              duplicate_b
            end
          end

          it 'arrives with no links' do
            expect(subject.linked_assessments).to be_empty
          end

          it 'still inherits linkable_tree_id across the boundary' do
            expect(subject.linkable_tree_id).to eq(assessment_b.id)
          end
        end

        # Copies made in the same run land in the destination course, so the links among THEM survive
        # the boundary. Only the links back to the source instance are dropped.
        context 'when a whole course is duplicated into another instance' do
          let(:other_instance) { create(:instance) }
          let(:new_course) do
            # Both forced first: `create(:administrator)` needs a tenant, and the block below has none.
            duplicator_user = admin
            destination_instance_id = other_instance.id
            ActsAsTenant.without_tenant do
              Course::Duplication::CourseDuplicationService.duplicate_course(
                source_course,
                current_user: duplicator_user,
                new_start_at: (source_course.start_at + 3.days).iso8601,
                new_title: "#{source_course.title} copy",
                destination_instance_id: destination_instance_id
              )
            end
          end

          it 'keeps the links between the copies and drops only the ones back to the source' do
            duplicate_b = new_course.assessments.find_by(title: assessment_b.title)
            duplicate_c = new_course.assessments.find_by(title: assessment_c.title)

            expect(duplicate_b.linked_assessments).to contain_exactly(duplicate_c)
            expect(duplicate_c.linked_assessments).to contain_exactly(duplicate_b)
          end
        end

        context 'when duplicating a course with multiple linked assessments' do
          let(:time_shift) { 3.days }
          let(:new_course) do
            options = {
              current_user: admin,
              new_start_at: (source_course.start_at + time_shift).iso8601,
              new_title: "#{source_course.title} copy"
            }
            Course::Duplication::CourseDuplicationService.duplicate_course(source_course, options)
          end
          it 'creates links to both original and duplicated assessments' do
            duplicate_b = new_course.assessments.find_by(title: assessment_b.title)
            duplicate_c = new_course.assessments.find_by(title: assessment_c.title)

            expect(duplicate_b.linked_assessments).to contain_exactly(
              assessment_a, assessment_b, assessment_c, duplicate_c
            )
            expect(duplicate_c.linked_assessments).to contain_exactly(
              assessment_b, assessment_c, duplicate_b
            )
          end
        end
      end
    end

    describe 'deletion behavior with links' do
      let(:course) { create(:course) }
      let!(:assessment_a) { create(:assessment, course: course) }
      let!(:assessment_b) { create(:assessment, course: course) }
      let!(:link) { Course::Assessment::Link.create!(assessment: assessment_a, linked_assessment: assessment_b) }

      context 'when deleting an assessment with outgoing links' do
        it 'deletes outgoing links but preserves linked assessments' do
          expect do
            assessment_a.destroy!
          end.
            to change { Course::Assessment::Link.count }.by(-1).
            and change { Course::Assessment.count }.by(-1)

          expect(Course::Assessment.exists?(assessment_b.id)).to be true
        end
      end

      context 'when deleting an assessment with incoming links' do
        it 'deletes incoming links but preserves linking assessments' do
          expect do
            assessment_b.destroy!
          end.
            to change { Course::Assessment::Link.count }.by(-1).
            and change { Course::Assessment.count }.by(-1)

          expect(Course::Assessment.exists?(assessment_a.id)).to be true
        end
      end
    end
  end
end
