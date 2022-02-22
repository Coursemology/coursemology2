# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Tag::Relationship, type: :model do
  it { is_expected.to belong_to(:tag) }
  it { is_expected.to belong_to(:child_tag) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      let(:tag1) { create(:course_tag, course: course) }
      let(:tag2) { create(:course_tag, course: course) }
      let(:tag3) { create(:course_tag, course: course) }

      context 'acyclic relationship' do
        let(:subject) { create(:course_tag_relationship, tag: tag1, child_tag: tag2) }
  
        it 'saves successfully' do
          expect(subject.errors[:cyclic_tags]).to be_empty
          subject.save!
        end
      end

      context 'direct cyclic relationship' do
        before do
          tag_relationship = create(:course_tag_relationship, tag: tag1, child_tag: tag2)
          tag_relationship.save!
        end

        let(:subject) { create(:course_tag_relationship, tag: tag2, child_tag: tag1) }

        it 'throws an error' do
          expect(subject.errors[:cyclic_tags]).to include("cannot add ancestor tag as a child of a tag")
          subject.save!
        end
      end

      context 'indirect cyclic relationship' do
        before do
          tag_relationship = create(:course_tag_relationship, tag: tag1, child_tag: tag2)
          tag_relationship.save!
          tag_relationship = create(:course_tag_relationship, tag: tag2, child_tag: tag3)
          tag_relationship.save!
        end

        let(:subject) { create(:course_tag_relationship, tag: tag3, child_tag: tag1) }

        it 'throws an error' do
          expect(subject.errors[:cyclic_tags]).to include("cannot add ancestor tag as a child of a tag")
          subject.save!
        end
      end
    end
  end
end
