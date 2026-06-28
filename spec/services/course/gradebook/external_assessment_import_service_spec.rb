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
        csv = "External ID,Midterm\nA001,41\nA002,37\n"
        expect { service(csv_data: csv, components: components).preview }.
          to not_change { Course::ExternalAssessmentGrade.count }.
          and(not_change { Course::ExternalAssessment.count })
      end

      it 'returns ok with the first 5 resolved rows (External IDs)' do
        csv = "External ID,Midterm\nA001,41\nA002,37\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(true)
        expect(result[:unresolved]).to be_empty
        expect(result[:sample].size).to eq(2)
        expect(result[:sample].map { |r| r[:identifier] }).to include(alice.external_id, bob.external_id)
        expect(result[:sample].first[:grades]['Midterm']).to eq(41.0)
      end

      it 'caps the sample at 5 rows but reports the true total in total_rows' do
        extra = (1..5).map { |i| create(:course_student, course: course, external_id: "X00#{i}") }
        ids = ['A001', 'A002'] + extra.map(&:external_id)
        csv = "External ID,Midterm\n#{ids.map { |id| "#{id},10" }.join("\n")}\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:sample].size).to eq(5)
        expect(result[:total_rows]).to eq(7)
      end

      it 'normalizes preview identifiers to the roster email when resolving by email' do
        csv = "Email,Midterm\n#{alice.user.email.upcase},41\n"
        result = service(csv_data: csv, components: components, identifier_mode: 'email').preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:identifier]).to eq(alice.user.email)
      end

      it 'fails the whole batch on any unresolved identifier' do
        csv = "External ID,Midterm\nA001,41\nZZZZ,37\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(false)
        expect(result[:unresolved]).to include('ZZZZ')
      end

      it 'flags a malformed (non-numeric) cell' do
        csv = "External ID,Midterm\nA001,oops\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(false)
        expect(result[:malformed]).to be_present
      end

      it 'rejects an in-file duplicate component name' do
        dup = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
               { name: 'Midterm', weightage: 20, maximum_grade: 40 }]
        csv = "External ID,Midterm,Midterm\nA001,1,2\n"
        expect { service(csv_data: csv, components: dup).preview }.
          to raise_error(described_class::ImportError)
      end

      it 'raises ImportError on wrong CSV header' do
        csv = "Wrong,Midterm\nA001,41\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError)
      end

      it 'raises duplicate_component_name (not bad_header) for an in-file duplicate component' do
        dup = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
               { name: 'Midterm', weightage: 20, maximum_grade: 40 }]
        csv = "External ID,Midterm,Midterm\nA001,1,2\n"
        expect { service(csv_data: csv, components: dup).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('duplicate_component_name')
          end
      end

      it 'rejects an otherwise-valid CSV with no data rows as empty_csv' do
        csv = "External ID,Midterm\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('empty_csv')
          end
      end

      it 'writes nothing and raises empty_csv on commit of a header-only CSV' do
        csv = "External ID,Midterm\n"
        expect do
          expect { service(csv_data: csv, components: components).commit(on_conflict: 'replace') }.
            to raise_error(described_class::ImportError)
        end.not_to(change { Course::ExternalAssessmentGrade.count })
      end

      it 'treats a whitespace-only cell as ungraded, not malformed' do
        csv = "External ID,Midterm\nA001,   \n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(true)
        expect(result[:malformed]).to be_empty
        expect(result[:sample].first[:grades]['Midterm']).to be_nil
      end

      it 'rejects duplicate identifiers even if unresolvable' do
        csv = "External ID,Midterm\nZZZZ,1\nZZZZ,2\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('duplicate_identifier')
            expect(error.payload[:identifiers]).to include('ZZZZ')
          end
      end

      it 'reports the malformed cell with its 1-based data-row number and component' do
        csv = "External ID,Midterm\nA001,41\nA002,oops\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:malformed]).to include('row 3, Midterm: oops')
      end

      it 'accumulates every malformed cell across rows and components' do
        comps = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
                 { name: 'Final', weightage: 50, maximum_grade: 100 }]
        csv = "External ID,Midterm,Final\nA001,bad,worse\n"
        result = service(csv_data: csv, components: comps).preview
        expect(result[:malformed].size).to eq(2)
      end

      it 'treats a blank cell as ungraded in the sample' do
        csv = "External ID,Midterm\nA001,\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:sample].first[:grades]['Midterm']).to be_nil
      end

      it 'accepts the External ID header in student_id mode' do
        csv = "External ID,Midterm\nA001,41\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:identifier]).to eq(alice.external_id)
      end

      it 'accepts the Email header in email mode' do
        csv = "Email,Midterm\n#{alice.user.email},41\n"
        result = service(csv_data: csv, components: components, identifier_mode: 'email').preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:identifier]).to eq(alice.user.email)
      end

      it 'rejects the External ID header when resolving by email' do
        csv = "External ID,Midterm\n#{alice.user.email},41\n"
        expect { service(csv_data: csv, components: components, identifier_mode: 'email').preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('bad_header')
          end
      end

      it 'reports duplicate headers in the bad_header payload' do
        csv = "External ID,Midterm,Midterm\nA001,1,2\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('bad_header')
            expect(error.payload[:duplicates]).to include(name: 'Midterm', count: 2)
          end
      end

      it 'leaves duplicates empty for a non-duplicate header mismatch' do
        csv = "Wrong,Midterm\nA001,41\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:duplicates]).to eq([])
          end
      end

      it 'reports only duplicates when every expected column is present but repeated' do
        csv = "External ID,Midterm,Midterm\nA001,1,2\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:duplicates]).to include(name: 'Midterm', count: 2)
            expect(error.payload[:missing]).to eq([])
            expect(error.payload[:unrecognized]).to eq([])
          end
      end

      it 'reports missing and unrecognized columns for a header mismatch' do
        csv = "External ID,Wrong\nA001,41\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:missing]).to eq(['Midterm'])
            expect(error.payload[:unrecognized]).to eq(['Wrong'])
          end
      end

      it 'returns the component columns in the CSV header order, not the defined order' do
        two_components = [
          { name: 'Midterm', weightage: 30, maximum_grade: 50 },
          { name: 'Final', weightage: 70, maximum_grade: 100 }
        ]
        # CSV lists Final before Midterm;.
        csv = "External ID,Final,Midterm\n80,A001,41\n"
        result = service(csv_data: csv, components: two_components).preview
        expect(result[:column_order]).to eq(['Final', 'Midterm'])
      end
    end

    describe '#preview out-of-range detection' do
      let(:oor_components) { [name: 'Midterms', maximum_grade: 100, weightage: 0] }
      let!(:charlie) { create(:course_student, course: course, external_id: 'S123') }

      it 'lists grades below 0 or above the component max without failing the preview' do
        csv = "External ID,Midterms\nS123,105\n"
        result = service(csv_data: csv, components: oor_components).preview
        expect(result[:ok]).to be(true) # out-of-range is advisory, not a block
        expect(result[:out_of_range]).to include(
          a_hash_including(
            component: 'Midterms',
            identifier: 'S123',
            grade: 105.0,
            kind: 'above',
            max: 100
          )
        )
      end

      it 'flags grades below 0' do
        csv = "External ID,Midterms\nS123,-2\n"
        result = service(csv_data: csv, components: oor_components).preview
        expect(result[:ok]).to be(true)
        expect(result[:out_of_range]).to include(
          a_hash_including(
            component: 'Midterms',
            identifier: 'S123',
            grade: -2.0,
            kind: 'below',
            max: 100
          )
        )
      end

      it 'does not flag a grade exactly at the maximum or at zero' do
        csv = "External ID,Midterms\nS123,100\nA001,0\n"
        result = service(csv_data: csv, components: oor_components).preview
        expect(result[:ok]).to be(true)
        expect(result[:out_of_range]).to be_empty
      end

      it 'ignores blank cells for out-of-range detection' do
        csv = "External ID,Midterms\nS123,\n"
        result = service(csv_data: csv, components: oor_components).preview
        expect(result[:out_of_range]).to be_empty
      end
    end

    describe '#commit (fresh import)' do
      let(:components) { [name: 'Midterm', weightage: 30, maximum_grade: 50] }

      it 'creates the external in the External Assessments category with the typed weight' do
        csv = "External ID,Midterm\nA001,41\nA002,37\n"
        summary = service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        external = Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
        expect(external).to be_present
        expect(external.maximum_grade).to eq(50)
        expect(external.gradebook_contribution.weight).to eq(30)
        expect(summary[:createdComponents]).to eq(1)
        expect(summary[:gradesWritten]).to eq(2)
      end

      it 'writes one grade row per resolved student bound to course_user' do
        csv = "External ID,Midterm\nA001,41\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        external = Course::ExternalAssessment.for_course(course).find_by!(title: 'Midterm')
        grade = external.external_assessment_grades.find_by!(course_user: alice)
        expect(grade.course_user_id).to eq(alice.id)
        expect(grade.grade).to eq(41)
        expect(grade.imported_identifier).to eq('A001')
      end

      it 'skips a blank cell on a fresh import (no grade row created)' do
        csv = "External ID,Midterm\nA001,\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        # After fix: blank cell on fresh import does NOT create a grade row (filter_map skips nil)
        external = Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
        expect(external.external_assessment_grades.count).to eq(0)
      end

      it 'accepts a grade greater than the max (no ceiling)' do
        csv = "External ID,Midterm\nA001,60\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        external = Course::ExternalAssessment.for_course(course).find_by!(title: 'Midterm')
        expect(external.external_assessment_grades.find_by!(course_user: alice).grade).to eq(60)
      end

      it 'creates multiple components as separate externals' do
        comps = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
                 { name: 'Final', weightage: 50, maximum_grade: 100 }]
        csv = "External ID,Midterm,Final\nA001,40,80\n"
        service(csv_data: csv, components: comps).commit(on_conflict: 'replace')
        expect(Course::ExternalAssessment.for_course(course).pluck(:title)).to contain_exactly('Midterm', 'Final')
        expect(Course::ExternalAssessment.for_course(course).find_by!(title: 'Midterm').
          external_assessment_grades.count).to eq(1)
        expect(Course::ExternalAssessment.for_course(course).find_by!(title: 'Final').
          external_assessment_grades.count).to eq(1)
      end

      it 'writes nothing when an identifier does not resolve' do
        csv = "External ID,Midterm\nA001,41\nZZZ,9\n"
        expect do
          expect do
            service(csv_data: csv, components: components).commit(on_conflict: 'replace')
          end.to raise_error(described_class::ImportError)
        end.not_to(change { Course::ExternalAssessmentGrade.count })
      end

      it 'raises validation_failed with the unresolved identifiers in the payload' do
        csv = "External ID,Midterm\nA001,41\nZZZ,9\n"
        expect { service(csv_data: csv, components: components).commit(on_conflict: 'replace') }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('validation_failed')
            expect(error.payload[:unresolved]).to include('ZZZ')
          end
      end

      it 'aborts the commit and writes nothing when a cell is malformed' do
        csv = "External ID,Midterm\nA001,41\nA002,oops\n"
        expect do
          expect do
            service(csv_data: csv, components: components).commit(on_conflict: 'replace')
          end.to raise_error(described_class::ImportError) { |e| expect(e.payload[:malformed]).to be_present }
        end.not_to(change { Course::ExternalAssessmentGrade.count })
      end

      it 'rolls back all components when a later component fails mid-write' do
        # Pre-create "Final" outside the service WITHOUT a gradebook_contribution so
        # the service treats it as new (existing_external matches by title) — instead,
        # create a title collision the service cannot reconcile.
        comps = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
                 { name: 'Quiz', weightage: 20, maximum_grade: 20 }]
        csv = "External ID,Midterm,Quiz\nA001,40,10\n"
        # Sabotage: make the second create! blow up by stubbing it to raise after the first wrote.
        call = 0
        allow(Course::ExternalAssessment).to receive(:create_for_course!).and_wrap_original do |orig, **kwargs|
          call += 1
          raise ActiveRecord::RecordInvalid if call == 2

          orig.call(**kwargs)
        end
        expect do
          expect do
            service(csv_data: csv, components: comps).commit(on_conflict: 'replace')
          end.to raise_error(ActiveRecord::RecordInvalid)
        end.to change { Course::ExternalAssessment.for_course(course).count }.by(0).
          and(change { Course::ExternalAssessmentGrade.count }.by(0))
      end
    end

    describe '#commit (upsert into existing component)' do
      let(:components) { [name: 'Midterm', weightage: 30, maximum_grade: 50] }

      def seed_initial!
        csv = "External ID,Midterm\nA001,10\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
      end

      it 'updates grades into the same component (no second tab)' do
        external = seed_initial!
        csv = "External ID,Midterm\nA001,20\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        expect(Course::ExternalAssessment.for_course(course).where(title: 'Midterm').count).to eq(1)
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(20)
      end

      it "keeps existing grades when on_conflict is 'keep'" do
        external = seed_initial!
        csv = "External ID,Midterm\nA001,99\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(10)
      end

      it 'inserts a grade for a brand-new student regardless of on_conflict' do
        external = seed_initial!
        csv = "External ID,Midterm\nA002,55\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: bob).grade).to eq(55)
      end

      it 'skips a blank cell on upsert (existing grade unchanged)' do
        external = seed_initial!
        csv = "External ID,Midterm\nA001,\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(10)
      end

      it 'never changes the external max or contribution weight on upsert' do
        external = seed_initial!
        csv = "External ID,Midterm\nA001,20\n"
        comps = [name: 'Midterm', weightage: 99, maximum_grade: 999]
        service(csv_data: csv, components: comps).commit(on_conflict: 'replace')
        expect(external.reload.maximum_grade).to eq(50)
        expect(external.gradebook_contribution.reload.weight).to eq(30)
      end

      it 'groups changed cells by student and drops unchanged / new-fill students' do
        seed_initial! # alice (A001) Midterm=10; bob (A002) has no grade yet
        csv = "External ID,Midterm\nA001,20\nA002,33\n"
        result = service(csv_data: csv, components: components).preview

        rows = result[:conflict_rows]
        expect(rows.map { |r| r[:studentName] }).to contain_exactly(alice.name)
        cell = rows.first[:cells]['Midterm']
        expect(cell[:existing]).to eq(10.0)
        expect(cell[:inFile]).to eq(20.0)
        expect(cell[:changed]).to be(true)
      end

      it 'drops a student whose grade is unchanged (equal at 2 dp)' do
        seed_initial! # alice Midterm=10
        csv = "External ID,Midterm\nA001,10.00\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:conflict_rows]).to be_empty
      end

      it 'flags a reassignment when an identifier now resolves to a different student than it was imported under' do
        seed_initial! # alice imported under 'A001' (snapshot 'A001' on alice's grade)
        alice.update!(external_id: 'AOLD') # free up A001
        carol = create(:course_student, course: course, external_id: 'A001') # A001 recycled to carol
        csv = "External ID,Midterm\nA001,77\n"
        result = service(csv_data: csv, components: components).preview

        entry = result[:reassignments].find { |r| r[:identifier] == 'A001' }
        expect(entry[:currentStudent]).to eq(carol.name)
        expect(entry[:previousStudents]).to include(alice.name)
        # carol is a brand-new insert, so she is NOT in the conflict table
        expect(result[:conflict_rows].map { |r| r[:studentName] }).not_to include(carol.name)
      end

      it 'does not flag a reassignment when only the same student\'s own identifier changed' do
        seed_initial! # alice imported under 'A001'
        bob.update!(external_id: 'A777')   # free A002
        alice.update!(external_id: 'A002') # alice's OWN id drifted A001 -> A002
        csv = "External ID,Midterm\nA002,20\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:reassignments]).to be_empty
      end

      it 'does not flag a reassignment when switching identifier mode between imports' do
        seed_initial! # alice imported under External ID 'A001'
        csv = "Email,Midterm\n#{alice.user.email},20\n"
        result = service(csv_data: csv, components: components, identifier_mode: 'email').preview
        expect(result[:reassignments]).to be_empty
      end

      it 'reports changed cells across multiple components on one student row' do
        comps = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
                 { name: 'Final', weightage: 50, maximum_grade: 100 }]
        service(csv_data: "External ID,Midterm,Final\nA001,10,80\n", components: comps).
          commit(on_conflict: 'replace')
        csv = "External ID,Midterm,Final\nA001,20,90\n"
        result = service(csv_data: csv, components: comps).preview

        expect(result[:conflict_rows].length).to eq(1)
        cells = result[:conflict_rows].first[:cells]
        expect(cells['Midterm'][:changed]).to be(true)
        expect(cells['Final'][:changed]).to be(true)
      end

      it 'returns updatedComponents: 1 after an upsert' do
        seed_initial!
        csv = "External ID,Midterm\nA001,20\n"
        summary = service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        expect(summary[:updatedComponents]).to eq(1)
        expect(summary[:createdComponents]).to eq(0)
      end

      it 'updates a nil existing grade even when on_conflict is keep' do
        external = seed_initial!
        # Manually clear the grade to nil (simulates a partial import that wrote the row but not the value)
        external.external_assessment_grades.find_by(course_user: alice).update_column(:grade, nil)
        csv = "External ID,Midterm\nA001,50\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(50)
      end

      it 'refreshes imported_identifier on upsert while preserving the original creator' do
        external = seed_initial! # alice imported under 'A001', value 10
        grade = external.external_assessment_grades.find_by(course_user: alice)
        original_creator_id = grade.creator_id
        alice.update!(external_id: 'A001-NEW')
        csv = "External ID,Midterm\nA001-NEW,22\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        grade.reload
        expect(grade.grade).to eq(22)
        expect(grade.imported_identifier).to eq('A001-NEW')
        expect(grade.creator_id).to eq(original_creator_id)
      end

      it 'inserts new students and upserts existing ones in a single replace commit' do
        external = seed_initial! # alice has Midterm=10, bob has none
        csv = "External ID,Midterm\nA001,15\nA002,20\n"
        summary = service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(15)
        expect(external.external_assessment_grades.find_by(course_user: bob).grade).to eq(20)
        expect(summary[:gradesWritten]).to eq(2)
      end

      it 'includes the unchanged cell with its real existing value when another cell changed' do
        comps = [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
                 { name: 'Final', weightage: 50, maximum_grade: 100 }]
        service(csv_data: "External ID,Midterm,Final\nA001,10,80\n", components: comps).
          commit(on_conflict: 'replace')
        csv = "External ID,Midterm,Final\nA001,20,80\n" # only Midterm changes
        result = service(csv_data: csv, components: comps).preview
        cells = result[:conflict_rows].first[:cells]
        expect(cells['Midterm']).to include(existing: 10.0, inFile: 20.0, changed: true)
        expect(cells['Final']).to include(existing: 80.0, inFile: 80.0, changed: false)
      end
    end

    describe 'determinacy' do
      let(:components) { [name: 'Midterm', weightage: 30, maximum_grade: 50] }

      it 'does not move a grade when the student external_id changes after import' do
        csv = "External ID,Midterm\nA001,41\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        grade = Course::ExternalAssessmentGrade.last
        alice.update!(external_id: 'CHANGED')
        expect(grade.reload.course_user_id).to eq(alice.id)
        expect(grade.grade).to eq(41)
      end
    end

    describe 'order-free assessment columns' do
      let(:components) do
        [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
         { name: 'Finals', weightage: 70, maximum_grade: 100 }]
      end

      it 'accepts assessment columns in any order, with the identifier first' do
        csv = "External ID,Finals,Midterm\nA001,1,2\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:grades]['Midterm']).to eq(2.0)
        expect(result[:sample].first[:grades]['Finals']).to eq(1.0)

        csv = "External ID,Midterm,Finals\nA001,1,2\n"
        result = service(csv_data: csv, components: components).preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:grades]['Midterm']).to eq(1.0)
        expect(result[:sample].first[:grades]['Finals']).to eq(2.0)
      end

      it 'rejects an unexpected extra column' do
        csv = "External ID,Midterm,Finals,Notes\nA001,41,61,x\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) { |e|
            expect(e.payload[:message]).to eq('bad_header')
          }
      end

      it 'rejects an unexpected extra column even when the number of headers are correct' do
        csv = "External ID,Finals,Notes\nA001,1,x\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) { |e|
            expect(e.payload[:message]).to eq('bad_header')
          }
      end

      it 'rejects a duplicated column' do
        csv = "External ID,Midterm,Midterm,Finals\nA001,41,41,61\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError)
      end

      it 'rejects a duplicated column even when the number of headers are correct' do
        csv = "External ID,Midterm,Midterm\nA001,41,41\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError)
      end

      it 'rejects a file missing the identifier column' do
        csv = "Midterm\n41\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('bad_header')
            expect(error.payload[:missing]).to include('External ID')
          end
      end
    end

    describe 'duplicate identifiers' do
      it 'rejects a CSV with the same identifier in two rows' do
        csv = "External ID,Midterm\nA001,40\nA001,50\n"
        expect { service(csv_data: csv, components: components).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('duplicate_identifier')
            expect(error.payload[:identifiers]).to include('A001')
          end
      end

      it 'treats case-different emails as the same duplicated identifier' do
        csv = "Email,Midterm\n#{alice.user.email},40\n#{alice.user.email.upcase},50\n"
        expect { service(csv_data: csv, components: components, identifier_mode: 'email').preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('duplicate_identifier')
          end
      end

      it 'writes nothing when an identifier is duplicated' do
        csv = "External ID,Midterm\nA001,40\nA001,50\n"
        expect do
          expect { service(csv_data: csv, components: components).commit(on_conflict: 'replace') }.
            to raise_error(described_class::ImportError)
        end.not_to(change { Course::ExternalAssessmentGrade.count })
      end
    end

    describe 'bad-header suggestions' do
      let(:components) { [name: 'Midterms', weightage: 30, maximum_grade: 50] }

      it 'suggests the near-miss uploaded header for a missing expected header' do
        csv = "External ID,Midterm\nA001,41\n" # header "Midterm" vs component "Midterms"
        error = nil
        begin
          service(csv_data: csv, components: components).preview
        rescue described_class::ImportError => e
          error = e
        end
        expect(error).to be_present
        expect(error.payload[:message]).to eq('bad_header')
        expect(error.payload[:suggestions]).to include(
          a_hash_including(expected: 'Midterms', didYouMean: 'Midterm')
        )
        # The typo pair is surfaced as a suggestion, not double-reported as a
        # plain missing/unrecognized column.
        expect(error.payload[:missing]).to eq([])
        expect(error.payload[:unrecognized]).to eq([])
      end

      it 'omits a suggestion when no uploaded header is within the edit-distance threshold' do
        csv = "External ID,Homework\nA001,41\n" # "Homework" is far from "Midterms"
        error = nil
        begin
          service(csv_data: csv, components: components).preview
        rescue described_class::ImportError => e
          error = e
        end
        expect(error.payload[:suggestions]).to be_empty
      end
    end

    describe 'commit write batching' do
      let(:roster) { [alice, bob] + create_list(:course_student, 8, course: course) }

      def write_query_count(&block)
        count = 0
        table = Course::ExternalAssessmentGrade.table_name

        counter = lambda do |*, payload|
          sql = payload[:sql].to_s

          count += 1 if sql =~ /\A\s*(INSERT|UPDATE)/i &&
                        sql.include?(table)
        end

        ActiveSupport::Notifications.subscribed(counter, 'sql.active_record', &block)

        count
      end

      def csv_for(students, value)
        rows = students.map { |s| "#{s.external_id},#{value}" }.join("\n")
        "External ID,Midterm\n#{rows}\n"
      end

      it 'inserts many brand-new grades with a single INSERT statement' do
        students = roster
        students.each { |s| s.update!(external_id: "E#{s.id}") }
        csv = csv_for(students, 41)

        writes = write_query_count do
          service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        end

        expect(Course::ExternalAssessmentGrade.where(course_user: students).count).to eq(students.size)
        expect(writes).to be <= 2 # one INSERT for the grades (+ at most the component create)
      end

      it 'replaces many existing grades without one UPDATE per row' do
        students = roster
        students.each { |s| s.update!(external_id: "E#{s.id}") }
        # First import seeds existing grades.
        service(csv_data: csv_for(students, 41), components: components).commit(on_conflict: 'replace')

        writes = write_query_count do
          service(csv_data: csv_for(students, 99), components: components).commit(on_conflict: 'replace')
        end

        grades = Course::ExternalAssessmentGrade.where(course_user: students).where.not(grade: nil).pluck(:grade)
        expect(grades).to all(eq(99))
        expect(writes).to be <= 1 # single upsert statement for all rows
      end

      it 'keeps existing non-null grades but fills nil ones under keep' do
        students = roster
        students.each { |s| s.update!(external_id: "E#{s.id}") }
        service(csv_data: csv_for(students, 41), components: components).commit(on_conflict: 'replace')
        external = Course::ExternalAssessment.for_course(course).find_by!(title: 'Midterm')
        blanked = students.first
        external.external_assessment_grades.find_by(course_user: blanked).update_column(:grade, nil)

        service(csv_data: csv_for(students, 99), components: components).commit(on_conflict: 'keep')
        grades = external.external_assessment_grades.where.not(course_user: blanked).pluck(:grade)
        expect(grades).to all(eq(41))
        expect(external.external_assessment_grades.find_by(course_user: blanked).grade).to eq(99)
      end
    end

    describe 'header ordering' do
      let(:components) do
        [{ name: 'Midterm', weightage: 30, maximum_grade: 50 },
         { name: 'Final', weightage: 70, maximum_grade: 100 }]
      end

      it 'returns column_order following the uploaded CSV header order (faithful preview)' do
        ordered = "External ID,Midterm,Final\nA001,41,80\n"
        shuffled = "External ID,Final,Midterm\nA001,80,41\n"
        a = service(csv_data: ordered, components: components).preview[:column_order]
        b = service(csv_data: shuffled, components: components).preview[:column_order]
        expect(a).to eq(%w[Midterm Final])
        expect(b).to eq(%w[Final Midterm])
      end

      it 'keeps canonical (position) order in define-step order, not CSV header order' do
        # CSV columns are in the opposite order to the defined components; the
        # gradebook's canonical order must follow the defined (append) order.
        csv = "External ID,Final,Midterm\nA001,80,41\n"
        service(csv_data: csv, components: components).commit(on_conflict: 'replace')
        titles = Course::ExternalAssessment.for_course(course).order(:position).pluck(:title)
        expect(titles).to eq(%w[Midterm Final])
      end

      it 'blocks when the identifier is present but not the first column' do
        csv = "Midterm,External ID,Final\n41,A001,80\n"
        error = service(csv_data: csv, components: components).preview rescue $ERROR_INFO # rubocop:disable Style/RescueModifier
        expect(error).to be_a(described_class::ImportError)
        expect(error.payload[:message]).to eq('bad_header')
        expect(error.payload[:identifierNotFirst]).to be(true)
      end

      it 'does not flag identifierNotFirst when the identifier is first' do
        csv = "External ID,Final,Midterm\nA001,80,41\n"
        expect { service(csv_data: csv, components: components).preview }.not_to raise_error
      end

      it 'treats a missing identifier as missing, not identifierNotFirst' do
        csv = "Midterm,Final\n41,80\n"
        begin
          service(csv_data: csv, components: components).preview
        rescue described_class::ImportError => e
          expect(e.payload[:identifierNotFirst]).to be(false)
          expect(e.payload[:missing]).to include('External ID')
        end
      end
    end
  end
end
