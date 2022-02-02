# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Condition::Material, type: :model do
  it { is_expected.to act_as(Course::Condition) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      subject do
        material = create(:material)
        build(:material_condition, course: course, material: material, conditional: material)
      end

      context 'when a material is its own condition' do
        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:material]).to include(I18n.t('activerecord.errors.models.' \
                                                              'course/condition/material.' \
                                                              'attributes.material.references_self'))
        end
      end

      context "when a material is already included in its conditional's conditions" do
        subject do
          existing_material_condition = create(:material_condition, course: course)
          build(:material_condition, course: course, conditional: existing_material_condition.conditional,
                                     material: existing_material_condition.material)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:material]).to include(I18n.t('activerecord.errors.models.' \
                                                              'course/condition/material.' \
                                                              'attributes.material.unique_dependency'))
        end
      end

      context 'when a material is required by another conditional with the same id' do
        subject do
          id = Time.now.to_i
          material = create(:material, id: id)
          achievement = create(:achievement, id: id)
          required_material = create(:material)
          create(:material_condition, course: course, material: required_material, conditional: achievement)
          build_stubbed(:material_condition, course: course, material: required_material, conditional: material)
        end

        it { is_expected.to be_valid }
      end

      context 'when a material has the conditional as its own condition' do
        subject do
          material1 = create(:material)
          material2 = create(:material)
          create(:material_condition, course: course, material: material1, conditional: material2)
          build(:material_condition, course: course, material: material2, conditional: material1)
        end

        it 'is not valid' do
          expect(subject).to_not be_valid
          expect(subject.errors[:material]).to include(I18n.t('activerecord.errors.models.' \
                                                              'course/condition/material.' \
                                                              'attributes.material.cyclic_dependency'))
        end
      end
    end

    describe '#title' do
      let(:material) { create(:material) }
      subject { create(:course_condition_material, material: material) }

      it 'returns the correct material title' do
        expect(subject.title).
          to eq(Course::Condition::Material.human_attribute_name('title.complete', material_title: material.name))
      end
    end

    describe '#satisfied_by?' do
      let(:course_user) { create(:course_student, course: course) }
      let(:material) { create(:material) }

      context 'when the course user has not downloaded the material' do
        subject { create(:course_condition_material, material: material) }

        it 'returns false' do
          expect(subject.satisfied_by?(course_user)).to be_falsey
        end
      end

      context 'when the course user has downloaded the material' do
        subject do
          Course::Material::Download.create(course_user_id: course_user.id, material_id: material.id)
          create(:course_condition_material, material: material)
        end

        it 'returns true' do
          expect(subject.satisfied_by?(course_user)).to be_truthy
        end
      end
    end

    describe '#dependent_object' do
      it 'returns the correct dependent material object' do
        expect(subject.dependent_object).to eq(subject.material)
      end
    end

    describe '.dependent_class' do
      it 'returns Course::Material' do
        expect(Course::Condition::Material.dependent_class).to eq(Course::Material.name)
      end
    end
  end
end
