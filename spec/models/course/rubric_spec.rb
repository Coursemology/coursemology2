# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    # Independent re-implementation of the migration's content_hash_for, used to lock hash parity
    # between the app-side #canonical_content and the historical migration. Structure-only and
    # order-independent (categories by name, criterions by grade); no grading_prompt/model_answer.
    def migration_style_hash(rubric)
      non_bonus = rubric.categories.reject(&:is_bonus_category).sort_by { |category| category.name.to_s }
      categories = non_bonus.map do |category|
        {
          name: category.name.to_s,
          criterions: category.criterions.sort_by(&:grade).map do |criterion|
            { grade: criterion.grade.to_i, explanation: criterion.explanation.to_s }
          end
        }
      end
      Digest::SHA256.hexdigest(categories.to_json)
    end

    describe 'content_hash on create' do
      subject(:rubric) { create(:course_rubric, course: course) }

      it 'stores a non-blank content_hash equal to the canonical content hash' do
        expect(rubric.content_hash).to be_present
        expect(rubric.content_hash).to eq(rubric.canonical_content_hash)
      end

      it 'matches an independent (migration-style) digest of the same content' do
        expect(rubric.content_hash).to eq(migration_style_hash(rubric))
      end
    end

    describe 'category weights' do
      subject(:rubric) { create(:course_rubric, course: course, category_count: 3) }

      it 'materialises category display order into sequential weights' do
        expect(rubric.categories.sort_by(&:weight).map(&:weight)).to eq([0, 1, 2])
      end
    end

    describe 'immutability (copy-on-write)' do
      let(:rubric) { create(:course_rubric, course: course) }

      it 'raises when updating a persisted rubric' do
        expect { rubric.update!(grading_prompt: 'Changed') }.to raise_error(ActiveRecord::ReadOnlyRecord)
      end

      it 'raises when updating a persisted category' do
        expect { rubric.categories.first.update!(name: 'Changed') }.to raise_error(ActiveRecord::ReadOnlyRecord)
      end

      it 'raises when updating a persisted criterion' do
        criterion = rubric.categories.first.criterions.first
        expect { criterion.update!(explanation: 'Changed') }.to raise_error(ActiveRecord::ReadOnlyRecord)
      end
    end

    describe '#copy_with' do
      let(:assessment) { create(:assessment, course: course) }
      let!(:question) { create(:course_assessment_question_rubric_based_response, assessment: assessment) }
      let!(:rubric) { Course::Rubric.build_from_v1(question, course).tap(&:save!) }

      context 'when the proposed content is identical' do
        it 'returns the same record without creating a new rubric' do
          expect do
            result = rubric.copy_with(
              grading_prompt: rubric.grading_prompt, model_answer: rubric.model_answer,
              categories: Course::Rubric.categories_from_v1(question)
            )
            expect(result).to eq(rubric)
          end.not_to change(Course::Rubric, :count)
        end
      end

      context 'when only the grading prompt changes' do
        it 'persists a new rubric (same structural hash), leaves the original intact, carries question links' do
          new_rubric = nil
          expect do
            new_rubric = rubric.copy_with(grading_prompt: 'A different prompt')
          end.to change(Course::Rubric, :count).by(1)

          expect(new_rubric).not_to eq(rubric)
          # content_hash is structure-only, so a prompt-only change leaves it unchanged (still compatible).
          expect(new_rubric.content_hash).to eq(rubric.content_hash)
          expect(new_rubric).not_to be_incompatible_with(rubric)
          expect(new_rubric.grading_prompt).to eq('A different prompt')
          expect(new_rubric.questions).to match_array(rubric.questions)
          expect(rubric.reload.grading_prompt).not_to eq('A different prompt')
        end
      end

      context 'when the categories change' do
        it 'persists a new, incompatible rubric with the new content' do
          new_categories = Course::Rubric.categories_from_v1(question)
          new_categories.first.name = 'Renamed category'

          result = nil
          expect do
            result = rubric.copy_with(categories: new_categories)
          end.to change(Course::Rubric, :count).by(1)

          expect(result.categories.map(&:name)).to include('Renamed category')
          expect(result).not_to eq(rubric)
          expect(result).to be_incompatible_with(rubric)
        end
      end

      context 'when categories are only reordered' do
        it 'is a no-op: the hash is order-independent, so the same record is returned' do
          reordered = Course::Rubric.categories_from_v1(question).reverse

          expect do
            result = rubric.copy_with(categories: reordered)
            expect(result).to eq(rubric)
          end.not_to change(Course::Rubric, :count)
        end
      end
    end

    describe 'duplication' do
      let!(:source_rubric) { create(:course_rubric, course: course, category_count: 3) }
      let(:destination_course) { create(:course) }

      subject(:duplicate) do
        # The Duplicator builds the object graph; persisting it is the caller's responsibility.
        Duplicator.new([], destination_course: destination_course).duplicate(source_rubric).tap(&:save!)
      end

      it 'produces an independent rubric re-homed to the destination course with identical content' do
        expect(duplicate).to be_persisted
        expect(duplicate.id).not_to eq(source_rubric.id)
        expect(duplicate.course).to eq(destination_course)
        expect(duplicate.content_hash).to eq(source_rubric.content_hash)
        expect(duplicate.categories.sort_by(&:weight).map(&:name)).
          to eq(source_rubric.categories.sort_by(&:weight).map(&:name))
      end
    end
  end
end
