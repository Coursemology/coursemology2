# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Gradebook::ExternalAssessmentImportService, type: :service do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:actor) { create(:course_manager, course: course).user }
    let!(:alice) { create(:course_student, course: course, external_id: 'A001') }
    let!(:bob) { create(:course_student, course: course, external_id: 'A002') }

    def service(csv_data:, components:, identifier_mode: 'student_id')
      described_class.new(
        course: course, actor: actor, components: components,
        identifier_mode: identifier_mode, csv_data: csv_data
      )
    end

    let(:components) { [name: 'Midterm', weightage: 30, maximum_grade: 50] }

    describe '#preview' do
      it 'writes nothing (dry-run)' do
        csv = "Identifier,Midterm\nA001,41\nA002,37\n"
        expect { service(csv_data: csv, components: components).preview }.
          not_to(change { Course::ExternalAssessmentGrade.count })
      end

      it 'returns ok with the first 5 resolved rows (student names)' do
        csv = "Identifier,Midterm\nA001,41\nA002,37\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(true)
        expect(result[:unresolved]).to be_empty
        expect(result[:sample].size).to eq(2)
        expect(result[:sample].map { |r| r[:studentName] }).to include(alice.name, bob.name)
        expect(result[:sample].first[:grades]['Midterm']).to eq(41.0)
      end

      it 'resolves by email when in email mode' do
        csv = "Identifier,Midterm\n#{alice.user.email},41\n"
        result = service(csv_data: csv, components: components, identifier_mode: 'email').preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:studentName]).to eq(alice.name)
      end

      it 'fails the whole batch on any unresolved identifier' do
        csv = "Identifier,Midterm\nA001,41\nZZZZ,37\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(false)
        expect(result[:unresolved]).to include('ZZZZ')
      end

      it 'flags a malformed (non-numeric) cell' do
        csv = "Identifier,Midterm\nA001,oops\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(false)
        expect(result[:malformed]).to be_present
      end

      it 'rejects an in-file duplicate component name' do
        dup = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
               { name: 'Midterm', weightage: 20, maximum_grade: 40 }]
        csv = "Identifier,Midterm,Midterm\nA001,1,2\n"
        expect { service(csv_data: csv, components: dup).preview }.
          to raise_error(described_class::ImportError)
      end

      it 'raises ImportError on wrong CSV header' do
        csv = "Wrong,Midterm\nA001,41\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError)
      end

      it 'returns ok with empty sample when CSV has no data rows' do
        csv = "Identifier,Midterm\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(true)
        expect(result[:sample]).to be_empty
        expect(result[:conflicts]).to be_empty
      end

      it 'resolves by email case-insensitively' do
        csv = "Identifier,Midterm\n#{alice.user.email.upcase},41\n"
        result = service(csv_data: csv, components: components, identifier_mode: 'email').preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:studentName]).to eq(alice.name)
      end

      it 'deduplicates unresolved identifiers' do
        csv = "Identifier,Midterm\nZZZZ,1\nZZZZ,2\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:unresolved].count('ZZZZ')).to eq(1)
      end

      it 'treats a blank cell as ungraded in the sample' do
        csv = "Identifier,Midterm\nA001,\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:sample].first[:grades]['Midterm']).to be_nil
      end
    end

    describe '#commit (fresh import)' do
      let(:components) { [name: 'Midterm', weightage: 30, maximum_grade: 50] }

      it 'creates the external in the External Assessments category with the typed weight' do
        csv = "Identifier,Midterm\nA001,41\nA002,37\n"
        summary = service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        external = Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
        expect(external).to be_present
        expect(external.maximum_grade).to eq(50)
        expect(external.gradebook_contribution.weight).to eq(30)
        expect(summary[:createdComponents]).to eq(1)
        expect(summary[:gradesWritten]).to eq(2)
      end

      it 'writes one grade row per resolved student bound to course_user' do
        csv = "Identifier,Midterm\nA001,41\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        external = Course::ExternalAssessment.for_course(course).find_by!(title: 'Midterm')
        grade = external.external_assessment_grades.find_by!(course_user: alice)
        expect(grade.course_user_id).to eq(alice.id)
        expect(grade.grade).to eq(41)
        expect(grade.imported_identifier).to eq('A001')
      end

      it 'skips a blank cell on a fresh import (no grade row created)' do
        csv = "Identifier,Midterm\nA001,\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        # After fix: blank cell on fresh import does NOT create a grade row (filter_map skips nil)
        external = Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
        expect(external.external_assessment_grades.count).to eq(0)
      end

      it 'accepts a grade greater than the max (no ceiling)' do
        csv = "Identifier,Midterm\nA001,60\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        external = Course::ExternalAssessment.for_course(course).find_by!(title: 'Midterm')
        expect(external.external_assessment_grades.find_by!(course_user: alice).grade).to eq(60)
      end

      it 'creates multiple components as separate externals' do
        comps = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
                 { name: 'Final', weightage: 50, maximum_grade: 100 }]
        csv = "Identifier,Midterm,Final\nA001,40,80\n"
        service(csv_data: csv, components: comps).commit(on_conflict: 'replace')
        expect(Course::ExternalAssessment.for_course(course).pluck(:title)).to contain_exactly('Midterm', 'Final')
        expect(Course::ExternalAssessment.for_course(course).find_by!(title: 'Midterm').
          external_assessment_grades.count).to eq(1)
        expect(Course::ExternalAssessment.for_course(course).find_by!(title: 'Final').
          external_assessment_grades.count).to eq(1)
      end

      it 'writes nothing when an identifier does not resolve' do
        csv = "Identifier,Midterm\nA001,41\nZZZ,9\n"
        expect do
          expect do
            service(csv_data: csv, components: components).commit(on_conflict: 'replace')
          end.to raise_error(described_class::ImportError)
        end.not_to(change { Course::ExternalAssessmentGrade.count })
      end
    end

    describe '#commit (upsert into existing component)' do
      let(:components) { [name: 'Midterm', weightage: 30, maximum_grade: 50] }

      def seed_initial!
        csv = "Identifier,Midterm\nA001,10\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
      end

      it 'updates grades into the same component (no second tab)' do
        external = seed_initial!
        csv = "Identifier,Midterm\nA001,20\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        expect(Course::ExternalAssessment.for_course(course).where(title: 'Midterm').count).to eq(1)
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(20)
      end

      it "keeps existing grades when on_conflict is 'keep'" do
        external = seed_initial!
        csv = "Identifier,Midterm\nA001,99\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(10)
      end

      it 'inserts a grade for a brand-new student regardless of on_conflict' do
        external = seed_initial!
        csv = "Identifier,Midterm\nA002,55\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: bob).grade).to eq(55)
      end

      it 'skips a blank cell on upsert (existing grade unchanged)' do
        external = seed_initial!
        csv = "Identifier,Midterm\nA001,\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(10)
      end

      it 'never changes the external max or contribution weight on upsert' do
        external = seed_initial!
        csv = "Identifier,Midterm\nA001,20\n"
        comps = [name: 'Midterm', weightage: 99, maximum_grade: 999]
        service(csv_data: csv, components: comps).commit(on_conflict: 'replace')
        expect(external.reload.maximum_grade).to eq(50)
        expect(external.gradebook_contribution.reload.weight).to eq(30)
      end

      it 'lists conflicts only for existing non-blank grade rows' do
        seed_initial!
        csv = "Identifier,Midterm\nA001,20\nA002,33\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:conflicts].map { |c| c[:studentName] }).to contain_exactly(alice.name)
        conflict = result[:conflicts].first
        expect(conflict[:existingGrade]).to eq(10.0)
        expect(conflict[:inFileGrade]).to eq(20.0)
      end

      it 'flags identifierMismatch when a row resolves to a student imported under a different id' do
        seed_initial! # alice imported under 'A001'
        bob.update!(external_id: 'A777')
        alice.update!(external_id: 'A002') # alice now owns A002 (formerly bob's)
        csv = "Identifier,Midterm\nA002,20\n" # A002 now → alice, but her grade was imported as 'A001'
        result = service(csv_data: csv, components: components).preview
        mismatch = result[:conflicts].find { |c| c[:studentName] == alice.name }
        expect(mismatch[:identifierMismatch]).to be(true)
      end

      it 'returns updatedComponents: 1 after an upsert' do
        seed_initial!
        csv = "Identifier,Midterm\nA001,20\n"
        summary = service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        expect(summary[:updatedComponents]).to eq(1)
        expect(summary[:createdComponents]).to eq(0)
      end

      it 'updates a nil existing grade even when on_conflict is keep' do
        external = seed_initial!
        # Manually clear the grade to nil (simulates a partial import that wrote the row but not the value)
        external.external_assessment_grades.find_by(course_user: alice).update_column(:grade, nil)
        csv = "Identifier,Midterm\nA001,50\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(50)
      end

      it 'detects conflicts across multiple components' do
        comps = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
                 { name: 'Final', weightage: 50, maximum_grade: 100 }]
        # Seed both components
        seed_csv = "Identifier,Midterm,Final\nA001,10,80\n"
        service(csv_data: seed_csv, components: comps).commit(on_conflict: 'replace')
        # Re-import with different values
        csv = "Identifier,Midterm,Final\nA001,20,90\n"
        result = service(csv_data: csv, components: comps).preview
        expect(result[:conflicts].map { |c| c[:component] }).to contain_exactly('Midterm', 'Final')
      end
    end

    describe 'determinacy' do
      let(:components) { [name: 'Midterm', weightage: 30, maximum_grade: 50] }

      it 'does not move a grade when the student external_id changes after import' do
        csv = "Identifier,Midterm\nA001,41\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        grade = Course::ExternalAssessmentGrade.last
        alice.update!(external_id: 'CHANGED')
        expect(grade.reload.course_user_id).to eq(alice.id)
        expect(grade.grade).to eq(41)
      end
    end
  end
end
