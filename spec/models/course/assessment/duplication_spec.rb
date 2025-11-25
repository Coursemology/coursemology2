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
          it 'preserves links to non-duplicated assessments' do
            duplicator = Duplicator.new([], {
              time_shift: 2.days,
              destination_course: source_course
            })
            duplicate_b = duplicator.duplicate(assessment_b)
            duplicate_b.save!

            # Should link to original B (where it was duplicated from), and inherit original A and C
            expect(duplicate_b.linked_assessments).to contain_exactly(assessment_a, assessment_b, assessment_c)
          end
        end

        context 'when duplicating a course with multiple linked assessments' do
          let(:time_shift) { 3.days }
          let(:new_course) do
            options = {
              current_user: admin,
              new_start_at: (source_course.start_at + time_shift).iso8601,
              new_title: I18n.t('course.duplications.show.new_course_title_prefix')
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
