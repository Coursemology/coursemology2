# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Tag, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:tags) }
  it { is_expected.to have_many(:child_tags).through(:relationships) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#is_ancestor_tag_id' do
      let(:subject) { create(:course_tag, course: course) }
      let(:other_tag) { create(:course_tag, course: course) }

      context 'tag without a parent' do
        it 'returns true for its own ID' do
          expect(subject.is_ancestor_tag_id(subject.id)).to be_truthy
        end

        it 'returns false for a non-existent tag ID' do
          expect(subject.is_ancestor_tag_id(0)).to be_falsey
        end

        it 'returns false for an unrelated tag ID' do
          expect(subject.is_ancestor_tag_id(other_tag.id)).to be_falsey
        end
      end

      context 'tag with a parent' do
        let(:parent_tag) { create(:course_tag, course: course) }
        before do
          tag_relationship = create(:course_tag_relationship, tag: parent_tag, child_tag: subject)
          tag_relationship.save!
        end

        it 'returns true for its parent tag ID' do
          expect(subject.is_ancestor_tag_id(parent_tag.id)).to be_truthy
        end

        it 'returns false for an unrelated tag ID' do
          expect(subject.is_ancestor_tag_id(other_tag.id)).to be_falsey
        end
      end

      context 'tag with an indirect ancestor' do
        let(:parent_tag) { create(:course_tag, course: course) }
        let(:ancestor_tag) { create(:course_tag, course: course) }
        before do
          parent_tag_relationship = create(:course_tag_relationship, tag: parent_tag, child_tag: subject)
          parent_tag_relationship.save!
          ancestor_tag_relationship = create(:course_tag_relationship, tag: ancestor_tag, child_tag: parent_tag)
          ancestor_tag_relationship.save!
        end

        it 'returns true for its parent tag ID' do
          expect(subject.is_ancestor_tag_id(parent_tag.id)).to be_truthy
        end

        it 'returns true for its ancestor tag ID' do
          expect(subject.is_ancestor_tag_id(ancestor_tag.id)).to be_truthy
        end

        it 'returns false for an unrelated tag ID' do
          expect(subject.is_ancestor_tag_id(other_tag.id)).to be_falsey
        end
      end
    end
  end
end
