# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Gradebook::ExternalAssessmentImportService, type: :service do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:teacher) { create(:course_manager, course: course).user }
    let!(:alice) { create(:course_student, course: course, external_id: 'A001') }
    let!(:bob) { create(:course_student, course: course, external_id: 'A002') }
    let!(:existing_final) do
      User.with_stamper(teacher) do
        Course::ExternalAssessment.create_for_course!(course: course, title: 'Final', maximum_grade: 100, weight: 50)
      end
    end

    def service(mappings, data: nil, identifier_mode: 'external_id', identifier_column: 'External ID')
      described_class.new(
        course: course, actor: teacher, identifier_mode: identifier_mode,
        identifier_column: identifier_column, csv_data: data, mappings: mappings
      )
    end

    describe 'mappings-based import' do
      let(:csv) { "External ID,Midterm,Final\nA001,80,90\n" }

      it 'creates a component using the mapping max_grade / weight' do
        result = service(
          [header: 'Midterm', action: 'create', target: 'Midterm', max_grade: 50, weight: 20],
          data: csv
        ).commit(on_conflict: 'replace')
        expect(result[:createdComponents]).to eq(1)
        ext = Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
        expect(ext.maximum_grade).to eq(50)
        expect(ext.gradebook_contribution.weight).to eq(20)
      end

      it 'defaults max_grade/weight to 100/0 when omitted' do
        service([header: 'Midterm', action: 'create', target: 'Midterm'], data: csv).
          commit(on_conflict: 'replace')
        ext = Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
        expect(ext.maximum_grade).to eq(100)
        expect(ext.gradebook_contribution.weight).to eq(0)
      end

      it 'writes grades to an existing target by title' do
        service([header: 'Final', action: 'existing', target: 'Final'], data: csv).
          commit(on_conflict: 'replace')
        expect(existing_final.reload.external_assessment_grades.first.grade).to eq(90)
      end

      it 'reads the identifier from the chosen column and ignores unmapped columns' do
        res = service([header: 'Midterm', action: 'create', target: 'Midterm'], data: csv).preview
        expect(res[:column_order]).to eq(['Midterm']) # Final unmapped -> ignored
        expect(res[:unresolved]).to be_empty
      end

      it 'labels preview columns by their mapped target, not the CSV header' do
        # CSV header 'Midterm' is renamed to a new component 'Quiz 3'. The preview
        # must key the column by the target so it lines up with the grades hash
        # (which parse_grades keys by target), not the header — otherwise the
        # renamed column renders blank.
        res = service([header: 'Midterm', action: 'create', target: 'Quiz 3'], data: csv).preview
        expect(res[:column_order]).to eq(['Quiz 3'])
        expect(res[:sample].first[:grades]).to include('Quiz 3' => 80.0)
      end

      it 'treats blank, dash and N/A cells as no-grade (nil), not malformed' do
        data = "External ID,Midterm\nS1,-\nS2,N/A\nS3,\n"
        expect do
          service([header: 'Midterm', action: 'create', target: 'Midterm'], data: data).preview
        end.not_to raise_error
      end

      it 'raises on a create target colliding with an existing assessment or another create' do
        expect { service([header: 'Final', action: 'create', target: 'Final'], data: csv).preview }.
          to raise_error(described_class::ImportError) # 'Final' already exists
      end

      it 'raises on two create mappings sharing a target (case-insensitive)' do
        mappings = [
          { header: 'Midterm', action: 'create', target: 'Quiz' },
          { header: 'Final', action: 'create', target: 'QUIZ' }
        ]
        expect { service(mappings, data: csv).preview }.to raise_error(described_class::ImportError) do |error|
          expect(error.payload[:message]).to eq('duplicate_target')
        end
      end

      it 'still raises on empty csv and duplicate identifiers' do
        empty = described_class.new(
          course: course, actor: teacher, identifier_mode: 'external_id',
          identifier_column: 'External ID', csv_data: "External ID,Midterm\n",
          mappings: [header: 'Midterm', action: 'create', target: 'Midterm']
        )
        expect { empty.preview }.to raise_error(described_class::ImportError)

        dup_csv = "External ID,Midterm\nA001,1\nA001,2\n"
        expect { service([header: 'Midterm', action: 'create', target: 'Midterm'], data: dup_csv).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('duplicate_identifier')
          end
      end

      it 'raises bad_header when the identifier column is missing' do
        data = "Midterm\n41\n"
        expect { service([header: 'Midterm', action: 'create', target: 'Midterm'], data: data).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('bad_header')
            expect(error.payload[:missing]).to include('External ID')
          end
      end

      it 'raises bad_header when a mapped header is missing from the file' do
        data = "External ID\nA001\n"
        expect { service([header: 'Midterm', action: 'create', target: 'Midterm'], data: data).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('bad_header')
            expect(error.payload[:missing]).to include('Midterm')
          end
      end

      it 'raises bad_header with duplicates when a mapped header repeats in the file' do
        data = "External ID,Midterm,Midterm\nA001,1,2\n"
        expect { service([header: 'Midterm', action: 'create', target: 'Midterm'], data: data).preview }.
          to raise_error(described_class::ImportError) do |error|
            expect(error.payload[:message]).to eq('bad_header')
            expect(error.payload[:duplicates]).to include(name: 'Midterm', count: 2)
          end
      end

      it 'flags a malformed (non-numeric) cell' do
        data = "External ID,Midterm\nA001,oops\n"
        result = service([header: 'Midterm', action: 'create', target: 'Midterm'], data: data).preview
        expect(result[:ok]).to be(false)
        expect(result[:malformed]).to include('row 2, Midterm: oops')
      end

      it 'fails the whole batch on any unresolved identifier' do
        data = "External ID,Midterm\nA001,41\nZZZZ,37\n"
        result = service([header: 'Midterm', action: 'create', target: 'Midterm'], data: data).preview
        expect(result[:ok]).to be(false)
        expect(result[:unresolved]).to include('ZZZZ')
      end

      it 'normalizes preview identifiers to the roster email when resolving by email' do
        data = "Email,Midterm\n#{alice.user.email.upcase},41\n"
        result = service(
          [header: 'Midterm', action: 'create', target: 'Midterm'],
          data: data, identifier_mode: 'email', identifier_column: 'Email'
        ).preview
        expect(result[:ok]).to be(true)
        expect(result[:sample].first[:identifier]).to eq(alice.user.email)
      end
    end

    describe 'out-of-range detection' do
      let!(:charlie) { create(:course_student, course: course, external_id: 'S123') }

      it 'lists grades below 0 or above the mapping max without failing the preview' do
        data = "External ID,Midterms\nS123,105\n"
        result = service(
          [header: 'Midterms', action: 'create', target: 'Midterms', max_grade: 100, weight: 0], data: data
        ).preview
        expect(result[:ok]).to be(true)
        expect(result[:out_of_range]).to include(
          a_hash_including(component: 'Midterms', identifier: 'S123', grade: 105.0, kind: 'above', max: 100)
        )
      end

      it 'uses the existing assessment maximum for an "existing" mapping' do
        data = "External ID,Final\nS123,150\n"
        result = service([header: 'Final', action: 'existing', target: 'Final'], data: data).preview
        expect(result[:out_of_range]).to include(
          a_hash_including(component: 'Final', identifier: 'S123', grade: 150.0, kind: 'above', max: 100)
        )
      end
    end

    describe '#commit upsert into existing component' do
      def seed_initial!
        data = "External ID,Midterm\nA001,10\n"
        service([header: 'Midterm', action: 'create', target: 'Midterm', max_grade: 50, weight: 30],
                data: data).commit(on_conflict: 'replace')
        Course::ExternalAssessment.for_course(course).find_by(title: 'Midterm')
      end

      it 'updates grades into the same component on a second import (no second tab)' do
        external = seed_initial!
        data = "External ID,Midterm\nA001,20\n"
        service([header: 'Midterm', action: 'existing', target: 'Midterm'], data: data).
          commit(on_conflict: 'replace')
        expect(Course::ExternalAssessment.for_course(course).where(title: 'Midterm').count).to eq(1)
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(20)
      end

      it "keeps existing grades when on_conflict is 'keep'" do
        external = seed_initial!
        data = "External ID,Midterm\nA001,99\n"
        service([header: 'Midterm', action: 'existing', target: 'Midterm'], data: data).
          commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: alice).grade).to eq(10)
      end

      it 'inserts a grade for a brand-new student regardless of on_conflict' do
        external = seed_initial!
        data = "External ID,Midterm\nA002,55\n"
        service([header: 'Midterm', action: 'existing', target: 'Midterm'], data: data).
          commit(on_conflict: 'keep')
        expect(external.external_assessment_grades.find_by(course_user: bob).grade).to eq(55)
      end
    end

    describe 'commit rollback' do
      it 'rolls back all components when a later component fails mid-write' do
        mappings = [
          { header: 'Midterm', action: 'create', target: 'Midterm', max_grade: 50, weight: 30 },
          { header: 'Quiz', action: 'create', target: 'Quiz', max_grade: 20, weight: 20 }
        ]
        data = "External ID,Midterm,Quiz\nA001,40,10\n"
        call = 0
        allow(Course::ExternalAssessment).to receive(:create_for_course!).and_wrap_original do |orig, **kwargs|
          call += 1
          raise ActiveRecord::RecordInvalid if call == 2

          orig.call(**kwargs)
        end
        expect do
          expect { service(mappings, data: data).commit(on_conflict: 'replace') }.
            to raise_error(ActiveRecord::RecordInvalid)
        end.to change { Course::ExternalAssessment.for_course(course).count }.by(0).
          and(change { Course::ExternalAssessmentGrade.count }.by(0))
      end
    end

    describe 'conflict rows and reassignments' do
      def seed_initial!
        data = "External ID,Midterm\nA001,10\n"
        service([header: 'Midterm', action: 'create', target: 'Midterm', max_grade: 50, weight: 30],
                data: data).commit(on_conflict: 'replace')
      end

      it 'groups changed cells by student and drops unchanged / new-fill students' do
        seed_initial! # alice (A001) Midterm=10; bob (A002) has no grade yet
        data = "External ID,Midterm\nA001,20\nA002,33\n"
        result = service([header: 'Midterm', action: 'existing', target: 'Midterm'], data: data).preview

        rows = result[:conflict_rows]
        expect(rows.map { |r| r[:studentName] }).to contain_exactly(alice.name)
        cell = rows.first[:cells]['Midterm']
        expect(cell[:existing]).to eq(10.0)
        expect(cell[:inFile]).to eq(20.0)
        expect(cell[:changed]).to be(true)
      end

      it 'flags a reassignment when an identifier now resolves to a different student' do
        seed_initial! # alice imported under 'A001' (snapshot 'A001' on alice's grade)
        alice.update!(external_id: 'AOLD') # free up A001
        carol = create(:course_student, course: course, external_id: 'A001') # A001 recycled to carol
        data = "External ID,Midterm\nA001,77\n"
        result = service([header: 'Midterm', action: 'existing', target: 'Midterm'], data: data).preview

        entry = result[:reassignments].find { |r| r[:identifier] == 'A001' }
        expect(entry[:currentStudent]).to eq(carol.name)
        expect(entry[:previousStudents]).to include(alice.name)
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

      let(:mappings) { [header: 'Midterm', action: 'create', target: 'Midterm', max_grade: 50, weight: 30] }

      it 'inserts many brand-new grades with a single INSERT statement' do
        students = roster
        students.each { |s| s.update!(external_id: "E#{s.id}") }
        data = csv_for(students, 41)

        writes = write_query_count do
          service(mappings, data: data).commit(on_conflict: 'replace')
        end

        expect(Course::ExternalAssessmentGrade.where(course_user: students).count).to eq(students.size)
        expect(writes).to be <= 2 # one INSERT for the grades (+ at most the component create)
      end

      it 'replaces many existing grades without one UPDATE per row' do
        students = roster
        students.each { |s| s.update!(external_id: "E#{s.id}") }
        service(mappings, data: csv_for(students, 41)).commit(on_conflict: 'replace')

        existing_mapping = [header: 'Midterm', action: 'existing', target: 'Midterm']
        writes = write_query_count do
          service(existing_mapping, data: csv_for(students, 99)).commit(on_conflict: 'replace')
        end

        grades = Course::ExternalAssessmentGrade.where(course_user: students).where.not(grade: nil).pluck(:grade)
        expect(grades).to all(eq(99))
        expect(writes).to be <= 1 # single upsert statement for all rows
      end
    end

    describe 'header ordering' do
      it 'follows the mapping order for column_order, independent of CSV column order' do
        mappings = [
          { header: 'Midterm', action: 'create', target: 'Midterm' },
          { header: 'Final', action: 'existing', target: 'Final' }
        ]
        data = "External ID,Final,Midterm\nA001,80,41\n"
        result = service(mappings, data: data).preview
        expect(result[:column_order]).to eq(%w[Midterm Final])
      end
    end
  end
end
