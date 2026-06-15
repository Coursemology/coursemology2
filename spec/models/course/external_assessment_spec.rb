# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExternalAssessment, type: :model do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'associations' do
      it { is_expected.to belong_to(:course) }
      it { is_expected.to have_one(:gradebook_contribution).dependent(:destroy) }
      it { is_expected.to have_many(:external_assessment_grades).dependent(:destroy) }
    end

    describe 'validations' do
      subject { build(:course_external_assessment, course: course) }
      it { is_expected.to validate_presence_of(:title) }

      it 'enforces course-scoped unique titles' do
        create(:course_external_assessment, course: course, title: 'Midterm')
        dup = build(:course_external_assessment, course: course, title: 'Midterm')
        expect(dup).not_to be_valid
        expect(dup.errors[:title]).to include(I18n.t('errors.messages.taken'))
      end

      it 'allows the same title in different courses' do
        create(:course_external_assessment, course: course, title: 'Midterm')
        other = build(:course_external_assessment, course: create(:course), title: 'Midterm')
        expect(other).to be_valid
      end
    end

    describe '.create_for_course!' do
      it 'creates the external and its contribution row' do
        external = nil
        expect do
          external = described_class.create_for_course!(course: course, title: 'Final',
                                                        maximum_grade: 80.0, weight: 30)
        end.to change(Course::Gradebook::Contribution, :count).by(1)
        expect(external.course).to eq(course)
        expect(external.gradebook_contribution.weight).to eq(30)
        expect(external.gradebook_contribution.weight_mode).to eq('equal')
      end

      it 'does not create any assessment tab or category' do
        course # ensure course (and its default tab/category) is created before measuring
        expect do
          described_class.create_for_course!(course: course, title: 'Final', maximum_grade: 80.0)
        end.to not_change(Course::Assessment::Tab, :count).and not_change(Course::Assessment::Category, :count)
      end

      it 'raises on duplicate title within the course' do
        described_class.create_for_course!(course: course, title: 'Final', maximum_grade: 80.0)
        expect do
          described_class.create_for_course!(course: course, title: 'Final', maximum_grade: 80.0)
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    describe '.for_course' do
      it 'returns only externals in the course' do
        mine = create(:course_external_assessment, course: course)
        create(:course_external_assessment, course: create(:course))
        expect(described_class.for_course(course)).to contain_exactly(mine)
      end
    end
  end
end
