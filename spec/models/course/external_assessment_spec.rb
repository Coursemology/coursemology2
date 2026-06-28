# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExternalAssessment, type: :model do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'associations' do
      it { is_expected.to belong_to(:course) }
      it { is_expected.to have_one(:gradebook_contribution).dependent(:destroy) }
      it { is_expected.to have_many(:external_assessment_grades).dependent(:delete_all) }
    end

    describe 'dependent destroy' do
      it 'destroys the gradebook contribution and grades when destroyed' do
        external = described_class.create_for_course!(course: course, title: 'Final', maximum_grade: 80.0)
        create(:course_external_assessment_grade, external_assessment: external)
        expect do
          external.destroy
        end.to change(Course::Gradebook::Contribution, :count).by(-1).
          and change(Course::ExternalAssessmentGrade, :count).by(-1)
      end
    end

    describe 'validations' do
      subject { build(:course_external_assessment, course: course) }
      it { is_expected.to validate_presence_of(:title) }
      it { is_expected.to validate_length_of(:title).is_at_most(255) }
      it { is_expected.to validate_presence_of(:maximum_grade) }

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

      it 'rejects a negative maximum_grade' do
        subject.maximum_grade = -1
        expect(subject).not_to be_valid
        expect(subject.errors[:maximum_grade]).to be_present
      end

      it 'accepts a zero maximum_grade' do
        subject.maximum_grade = 0
        expect(subject).to be_valid
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

      it 'rolls back the external when contribution creation fails' do
        allow(Course::Gradebook::Contribution).to receive(:create!).
          and_raise(ActiveRecord::RecordInvalid.new(Course::Gradebook::Contribution.new))
        expect do
          expect do
            described_class.create_for_course!(course: course, title: 'Final', maximum_grade: 80.0)
          end.to raise_error(ActiveRecord::RecordInvalid)
        end.to not_change(described_class, :count)
      end
    end

    describe '#synthetic_tab_id' do
      it 'returns the negative of the record id' do
        external = create(:course_external_assessment, course: course)
        expect(external.synthetic_tab_id).to eq(-external.id)
      end
    end

    describe '.for_course' do
      it 'returns only externals in the course' do
        mine = create(:course_external_assessment, course: course)
        create(:course_external_assessment, course: create(:course))
        expect(described_class.for_course(course)).to contain_exactly(mine)
      end
    end

    describe 'grade-bounding defaults' do
      it 'defaults floor_at_zero and cap_at_maximum to true' do
        external = Course::ExternalAssessment.create_for_course!(
          course: course, title: 'Midterm', maximum_grade: 50
        )
        expect(external.floor_at_zero).to be(true)
        expect(external.cap_at_maximum).to be(true)
      end

      it 'honours explicit bound flags' do
        external = Course::ExternalAssessment.create_for_course!(
          course: course, title: 'Bonus', maximum_grade: 10,
          floor_at_zero: false, cap_at_maximum: false
        )
        expect(external.floor_at_zero).to be(false)
        expect(external.cap_at_maximum).to be(false)
      end
    end

    describe 'positioning' do
      let(:course) { create(:course) }

      it 'appends new assessments at the end of the course' do
        first = create(:course_external_assessment, course: course)
        second = create(:course_external_assessment, course: course)
        expect([first.reload.position, second.reload.position]).to eq([0, 1])
      end

      it 'scopes positions per course' do
        other = create(:course)
        a = create(:course_external_assessment, course: course)
        b = create(:course_external_assessment, course: other)
        expect([a.reload.position, b.reload.position]).to eq([0, 0])
      end

      describe '.reorder!' do
        it 'rewrites positions to the given order' do
          a = create(:course_external_assessment, course: course)
          b = create(:course_external_assessment, course: course)
          c = create(:course_external_assessment, course: course)
          described_class.reorder!(course: course, ordered_ids: [c.id, a.id, b.id])
          expect([a.reload.position, b.reload.position, c.reload.position]).to eq([1, 2, 0])
        end

        it 'raises when the id set does not match the course externals' do
          a = create(:course_external_assessment, course: course)
          expect { described_class.reorder!(course: course, ordered_ids: [a.id, a.id + 999]) }.
            to raise_error(ArgumentError)
        end
      end
    end
  end
end
