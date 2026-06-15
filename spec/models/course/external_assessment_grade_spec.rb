# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ExternalAssessmentGrade, type: :model do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    describe 'validations' do
      subject { build(:course_external_assessment_grade) }

      it { is_expected.to be_valid }

      it 'allows a null grade (ungraded)' do
        subject.grade = nil
        expect(subject).to be_valid
      end

      it 'allows a grade greater than the maximum (no ceiling, bonus-consistent)' do
        subject.external_assessment.maximum_grade = 10
        subject.grade = 15
        expect(subject).to be_valid
      end

      it 'enforces one grade per (external_assessment, course_user)' do
        existing = create(:course_external_assessment_grade)
        duplicate = build(:course_external_assessment_grade,
                          external_assessment: existing.external_assessment,
                          course_user: existing.course_user)
        expect(duplicate).not_to be_valid
      end

      it 'requires a course_user' do
        subject.course_user = nil
        expect(subject).not_to be_valid
      end

      it 'rejects a non-numeric grade string' do
        subject.grade = 'abc'
        expect(subject).not_to be_valid
      end

      it 'requires an external_assessment' do
        subject.external_assessment = nil
        expect(subject).not_to be_valid
      end
    end

    describe 'determinacy — grade binds to course_user, not the identifier string' do
      it 'does not move an existing grade when the student external_id changes after import' do
        grade = create(:course_external_assessment_grade, imported_identifier: 'A0001X', grade: 5)
        course_user = grade.course_user

        course_user.update!(external_id: 'A9999Z')

        expect(grade.reload.course_user_id).to eq(course_user.id)
        expect(grade.grade).to eq(5)
      end
    end
  end
end
