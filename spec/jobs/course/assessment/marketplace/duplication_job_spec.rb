# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::DuplicationJob, type: :job do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:source_course) { create(:course) }
    let(:source_assessment) do
      create(:assessment, :with_mcq_question,
             course: source_course,
             title: "Marketplace source #{Process.pid}-#{object_id}")
    end
    # Published through the real service: the job duplicates the container SNAPSHOT, not the
    # authoring copy, so the snapshot must be a genuine copy carrying the questions.
    let(:listing) do
      Course::Assessment::Marketplace::PublishService.publish(source_assessment, user)
    end
    let(:destination_course) { create(:course) }
    let(:destination_tab) { destination_course.assessment_categories.first.tabs.first }
    let(:user) { create(:administrator) }

    def run
      described_class.perform_now([listing.id], destination_course, destination_tab.id, current_user: user)
    end

    it 'duplicates the assessment into the destination course' do
      expect { run }.to change { destination_course.assessments.count }.by(1)
    end

    it 'lands the copy in the chosen tab' do
      run
      copy = destination_course.assessments.order(:created_at).last
      expect(copy.tab_id).to eq(destination_tab.id)
    end

    it 'writes an adoption row for the copy' do
      expect { run }.to change { Course::Assessment::Marketplace::Adoption.count }.by(1)
      adoption = Course::Assessment::Marketplace::Adoption.last
      expect(adoption.listing).to eq(listing)
      expect(adoption.destination_course).to eq(destination_course)
    end

    it 'counts the same destination course only once across two duplications' do
      run
      run
      expect(listing.reload.adoption_count).to eq(1)
    end

    it 'skips unpublished listings (job re-filters `.published`)' do
      listing.update!(published: false)
      expect { run }.not_to change(destination_course.assessments, :count)
      # Relative, not `Adoption.count == 0`: the duplication path commits outside the example's
      # transaction (rows persist across runs), so only the delta from `run` is meaningful here.
      expect { run }.not_to change(Course::Assessment::Marketplace::Adoption, :count)
    end

    it 'duplicates every listing when given several ids' do
      other = Course::Assessment::Marketplace::PublishService.
              publish(create(:assessment, :with_mcq_question, course: source_course), user)
      expect do
        described_class.perform_now([listing.id, other.id], destination_course, destination_tab.id, current_user: user)
      end.to change { destination_course.assessments.count }.by(2).
        and change { Course::Assessment::Marketplace::Adoption.count }.by(2)
    end

    describe 'versioned duplication' do
      it 'duplicates the snapshot, not the authoring copy' do
        # Materialize under the tenant first: the lazy `source_course` let would otherwise be
        # created inside `without_tenant` and fail Course's instance-presence validation.
        listing
        snapshot_title = ActsAsTenant.without_tenant { listing.current_version.assessment.title }
        source_assessment.update!(title: 'Renamed after publish')

        run

        adoption = Course::Assessment::Marketplace::Adoption.
                   find_by(listing: listing, destination_course: destination_course)
        expect(adoption.duplicated_assessment.title).to eq(snapshot_title)
        expect(adoption.duplicated_assessment.title).not_to eq('Renamed after publish')
      end

      it 'records the adopted version publish date' do
        run

        adoption = Course::Assessment::Marketplace::Adoption.
                   find_by(listing: listing, destination_course: destination_course)
        expect(adoption.adopted_version_at).to be_within(1.second).of(listing.current_version.published_at)
      end

      # The copy keeps the source's duplication root, so everything descended from the origin stays
      # comparable, but carries no link rows: adoption crosses out of the preview instance and
      # `#initialize_duplicate` drops links that would span the boundary.
      it 'keeps the source root and arrives with no links' do
        run
        copy = destination_course.assessments.order(:created_at).last
        snapshot = ActsAsTenant.without_tenant { listing.current_version.assessment }

        expect(copy.linkable_tree_id).to eq(snapshot.linkable_tree_id)
        expect(copy.linked_assessments).to be_empty
        expect(copy.reverse_linked_assessments).to be_empty
      end

      it 'lets an adopted copy be duplicated onward to a third course' do
        run
        copy = destination_course.assessments.order(:created_at).last
        third_course = create(:course)

        expect do
          Course::Duplication::ObjectDuplicationService.duplicate_objects(
            destination_course, third_course, copy, current_user: user
          )
        end.to change { third_course.assessments.count }.by(1)
      end

      # A re-import leaves the copy it supersedes alone: that copy is still genuinely behind, so
      # its own banner keeps standing until it is updated or deleted.
      it 'leaves a prior adoption in the same course at its own vintage' do
        prior = create(:course_assessment_marketplace_adoption,
                       listing: listing, destination_course: destination_course,
                       adopted_version_at: 30.days.ago.change(usec: 0))

        expect { run }.not_to(change { prior.reload.adopted_version_at })
      end
    end

    # The completion toast's link is built from `job.redirect_to`. Before this, every duplication —
    # including the single-assessment "Import latest version" from the adopter banner — landed on the
    # tab index, which cannot tell the fresh copy from the one it supersedes.
    describe 'completion redirect' do
      # `perform_now` on an instance (rather than the class) is what keeps the tracking Job record
      # reachable afterwards; `described_class.perform_now(...)` discards it.
      def run_and_capture(tab_id = destination_tab.id, ids = [listing.id])
        job = described_class.new(ids, destination_course, tab_id, current_user: user)
        job.perform_now
        job.job
      end

      it 'links to the copy itself when a single assessment landed' do
        redirect = run_and_capture.redirect_to
        copy = Course::Assessment::Marketplace::Adoption.
               find_by(listing: listing, destination_course: destination_course).duplicated_assessment

        # `end_with` rather than a whole-URL `eq`: the point being pinned is the destination, and the
        # scheme/port prefix is `default_url_options`' business, not this job's.
        expect(redirect).to include(destination_course.instance.host)
        expect(redirect).to end_with("/courses/#{destination_course.id}/assessments/#{copy.id}")
      end

      it 'keeps the tab index when several assessments landed' do
        other = Course::Assessment::Marketplace::PublishService.
                publish(create(:assessment, :with_mcq_question, course: source_course), user)

        redirect = run_and_capture(destination_tab.id, [listing.id, other.id])

        expect(redirect.redirect_to).to include("/courses/#{destination_course.id}/assessments?")
        expect(redirect.redirect_to).to include("tab=#{destination_tab.id}")
      end

      # The old code read `assessment_categories.first.id`, which is the destination tab's category
      # only by accident. Sourcing it from the copy's own tab is what makes the index link land on
      # the tab the copies are actually in.
      it 'sources the index category from the destination tab, not the first category' do
        second_category = create(:course_assessment_category, course: destination_course)
        second_tab = second_category.tabs.first
        other = Course::Assessment::Marketplace::PublishService.
                publish(create(:assessment, :with_mcq_question, course: source_course), user)

        redirect = run_and_capture(second_tab.id, [listing.id, other.id]).redirect_to

        expect(redirect).to include("category=#{second_category.id}")
        expect(redirect).not_to include("category=#{destination_course.assessment_categories.first.id}")
      end

      # Nothing landed, so there is nowhere honest to send the manager. The toast renders its link
      # conditionally, so a nil redirect simply omits it.
      it 'sets no redirect when every listing was filtered out' do
        listing.update!(published: false)

        expect(run_and_capture.redirect_to).to be_nil
      end
    end

    # Two copies of one listing in one tab are otherwise indistinguishable: same title, same
    # everything. The suffix names the CONTENT vintage the copy carries, which is the fact that
    # actually separates them — and the rule now fires on ANY title collision in the destination
    # course, not only on re-import of the same listing.
    describe 'title collision' do
      # Backdated so the assertion cannot pass by accident on an implementation that stamps today's
      # date. v1 answers `published_at` with the listing's `first_published_at`.
      let(:vintage) { Time.zone.parse('2026-06-12T09:00:00') }

      def copies_in_destination
        Course::Assessment::Marketplace::Adoption.
          where(listing: listing, destination_course: destination_course).
          map(&:duplicated_assessment)
      end

      def snapshot_title
        ActsAsTenant.without_tenant { listing.current_version.assessment.title }
      end

      def backdate_current_version(record = listing)
        ActsAsTenant.without_tenant { record.current_version.update!(published_at: vintage) }
      end

      it 'leaves a first adoption untouched when nothing collides' do
        listing

        run

        expect(copies_in_destination.map(&:title)).to eq([snapshot_title])
      end

      it 'stamps the second copy with the version publish date' do
        backdate_current_version
        expected = "#{snapshot_title} [12 Jun 2026]"

        run
        run

        expect(copies_in_destination.map(&:title)).
          to contain_exactly(snapshot_title, expected)
      end

      # The new behaviour: an unrelated assessment already holding the name is enough. Previously
      # only a re-import of the SAME listing triggered a stamp, so this landed as a silent duplicate.
      it 'stamps a first adoption that collides with an unrelated assessment' do
        backdate_current_version
        create(:assessment, course: destination_course, tab: destination_tab,
                            title: snapshot_title)

        run

        expect(copies_in_destination.map(&:title)).to eq(["#{snapshot_title} [12 Jun 2026]"])
      end

      # "Lab 3" and "lab 3" side by side is exactly the confusion this rule prevents.
      it 'treats a differently-cased title as a collision' do
        backdate_current_version
        create(:assessment, course: destination_course, tab: destination_tab,
                            title: snapshot_title.upcase)

        run

        expect(copies_in_destination.map(&:title)).to eq(["#{snapshot_title} [12 Jun 2026]"])
      end

      # A duplicate two tabs away is as confusing as one in the same tab.
      it 'detects a collision in another tab of the destination course' do
        backdate_current_version
        other_category = create(:course_assessment_category, course: destination_course)
        other_tab = create(:course_assessment_tab, category: other_category)
        create(:assessment, course: destination_course, tab: other_tab, title: snapshot_title)

        run

        expect(copies_in_destination.map(&:title)).to eq(["#{snapshot_title} [12 Jun 2026]"])
      end

      # Same listing, same day, twice: the dated suffix itself now collides, so the counter breaks
      # the tie.
      it 'appends a counter when the dated title is also taken' do
        backdate_current_version

        run
        run
        run

        expect(copies_in_destination.map(&:title)).
          to contain_exactly(snapshot_title,
                             "#{snapshot_title} [12 Jun 2026]",
                             "#{snapshot_title} [12 Jun 2026] (2)")
      end

      it 'keeps incrementing the counter past two' do
        backdate_current_version

        4.times { run }

        expect(copies_in_destination.map(&:title)).
          to include("#{snapshot_title} [12 Jun 2026] (3)")
      end

      # The stamp must be the CONTENT's vintage, not when anyone clicked import. Backdating the
      # listing is what separates the two — an import-date implementation would write today.
      it 'does not use the import date' do
        backdate_current_version

        run
        run

        stamped = copies_in_destination.map(&:title).max_by(&:length)
        expect(stamped).to include('12 Jun 2026')
        expect(stamped).not_to include(Time.zone.today.strftime('%d %b %Y'))
      end

      # The adoption row dies with its copy (`duplicated_assessment_id` FK is `on_delete: :cascade`),
      # so a manager who deleted their old copy has nothing to be confused with and gets a clean
      # title back.
      it 'leaves the title clean when the previous copy was deleted' do
        backdate_current_version

        run
        copies_in_destination.each(&:destroy!)
        run

        expect(copies_in_destination.map(&:title)).to eq([snapshot_title])
      end

      # The base always comes from the immutable container snapshot, never from the previous copy, so
      # a third import cannot produce "... [12 Jun 2026] [12 Jun 2026]".
      it 'does not compound the suffix across repeated re-imports' do
        backdate_current_version

        run
        run
        run

        expect(copies_in_destination.map(&:title)).
          to all(satisfy { |title| title.scan('[12 Jun 2026]').length <= 1 })
      end

      # `title` is capped at 255 on Course::LessonPlan::Item, and the dated suffix is 14 characters.
      # Without truncation the second import raises ActiveRecord::RecordInvalid.
      #
      # 242, not 255, on purpose. The material folder is named after the title, and the second copy's
      # folder collides with the first's, so `Folder#assign_valid_name` appends " (0)" — at 255 that
      # overflows the folder's own 255-char limit and duplication dies before the title logic runs.
      # 242 still exceeds `255 - 14`, so the truncation branch is genuinely exercised.
      it 'truncates a long base title rather than overflowing the column' do
        long = create(:assessment, :with_mcq_question, course: source_course, title: 'T' * 242)
        long_listing = Course::Assessment::Marketplace::PublishService.publish(long, user)
        backdate_current_version(long_listing)

        3.times do
          described_class.perform_now([long_listing.id], destination_course, destination_tab.id,
                                      current_user: user)
        end

        titles = Course::Assessment::Marketplace::Adoption.
                 where(listing: long_listing, destination_course: destination_course).
                 map { |adoption| adoption.duplicated_assessment.title }
        stamped = titles.select { |title| title.include?('[12 Jun 2026]') }
        expect(stamped).to contain_exactly(end_with(' [12 Jun 2026]'), end_with(' [12 Jun 2026] (2)'))
        expect(stamped.map(&:length)).to all(be <= 255)
        expect(stamped.uniq.size).to eq(stamped.size)
      end

      # A listing with no recorded vintage has nothing to name. Stamping "[]" would be worse than
      # leaving the collision — the counter still separates the copies.
      it 'falls back to the counter when the version has no publish date' do
        listing
        create(:assessment, course: destination_course, tab: destination_tab,
                            title: snapshot_title)
        copy = create(:assessment, course: destination_course, tab: destination_tab,
                                   title: snapshot_title)
        listing_without_version = instance_double(Course::Assessment::Marketplace::Listing, current_version: nil)

        described_class.new.send(:resolve_title_collision, copy, listing_without_version, destination_course)

        expect(copy.reload.title).to eq("#{snapshot_title} (2)")
      end
    end

    # The sidebar entry point sends no tab, and a tab from another course can be sent by an
    # out-of-date URL. Neither may leave the redirect pointing at a tab the user cannot open.
    describe 'when the requested tab is absent or foreign' do
      def run_with_tab(tab_id)
        job = described_class.new([listing.id], destination_course, tab_id, current_user: user)
        job.perform_now
        job.job
      end

      let(:default_tab) { destination_course.assessment_categories.first.tabs.first }

      # Where the copy LANDS, not where the toast links — the redirect is `completion redirect`'s
      # subject, and for a single copy it now names the copy rather than the tab index.
      it 'lands the copy in the default tab when no tab is given' do
        run_with_tab(nil)
        copy = destination_course.assessments.order(:created_at).last
        expect(copy.tab_id).to eq(default_tab.id)
      end

      it 'ignores a tab belonging to another course' do
        foreign_tab = create(:course).assessment_categories.first.tabs.first
        run_with_tab(foreign_tab.id)
        copy = destination_course.assessments.order(:created_at).last
        expect(copy.tab_id).to eq(default_tab.id)
      end
    end

    describe 'the listing is not itself duplicated' do
      # Force the listing before the `expect` blocks below: `run` would otherwise create it lazily
      # inside the block and register as a listing-count change of its own.
      before { listing }

      it 'does not create a second listing row' do
        expect { run }.not_to change(Course::Assessment::Marketplace::Listing, :count)
      end

      it 'leaves the duplicated copy unlisted' do
        run
        copy = destination_course.assessments.order(:created_at).last
        expect(copy.marketplace_listing).to be_nil
      end

      it 'holds the listing count steady while adoptions accumulate' do
        other_course = create(:course)
        expect do
          run
          described_class.perform_now([listing.id], other_course,
                                      other_course.assessment_categories.first.tabs.first.id,
                                      current_user: user)
        end.to change { listing.reload.adoption_count }.from(0).to(2).
          and not_change(Course::Assessment::Marketplace::Listing, :count)
      end
    end

    # Marketplace content leaves a course by paths that do not go through this job: an instructor
    # duplicating selected objects, or a full course duplication carrying the assessment along. Both
    # must keep the listing singular, and both must record the destination as an adopter -- but only
    # for content that came THROUGH the marketplace, which is what separates these two describes.
    describe 'manual duplication of the assessment that authors a listing' do
      let(:manual_destination) { create(:course) }

      before { listing }

      def duplicate_selected_objects
        Course::Duplication::ObjectDuplicationService.duplicate_objects(
          source_course, manual_destination, source_assessment, current_user: user
        )
      end

      def duplicate_whole_course
        Course::Duplication::CourseDuplicationService.duplicate_course(
          source_course, current_user: user, new_title: "#{source_course.title} copy"
        )
      end

      context 'when duplicating selected objects' do
        it 'does not create a second listing row' do
          expect { duplicate_selected_objects }.not_to change(Course::Assessment::Marketplace::Listing, :count)
        end

        it 'leaves the manual copy unlisted' do
          copy = duplicate_selected_objects
          expect(copy.marketplace_listing).to be_nil
        end

        # The publisher handing their own assessment to somebody directly bypassed the marketplace
        # entirely, so the marketplace has no adoption to record.
        it 'records no adoption' do
          expect { duplicate_selected_objects }.
            not_to change(Course::Assessment::Marketplace::Adoption, :count)
        end
      end

      context 'when duplicating the whole course' do
        it 'does not create a second listing row' do
          expect { duplicate_whole_course }.not_to change(Course::Assessment::Marketplace::Listing, :count)
        end

        it 'leaves the copied assessment unlisted' do
          new_course = duplicate_whole_course
          expect(new_course.assessments.map(&:marketplace_listing)).to all(be_nil)
        end

        # The publisher rolling their own course forward. Recorded, this would let a listing nobody
        # has adopted show an adoption count that climbs by one every semester its author re-runs.
        it 'records no adoption' do
          expect { duplicate_whole_course }.
            not_to change(Course::Assessment::Marketplace::Adoption, :count)
        end
      end
    end

    # The other half: an ADOPTED copy carried along by ordinary duplication. This is the semester
    # roll-forward, and the copy it makes both counts as a course using the listing and stays
    # reachable by the listing's version reminders.
    describe 'manual duplication of an adopted copy' do
      let(:adopting_course) { create(:course) }

      # The real import path, so the copy carries a genuine adoption row rather than a hand-built one.
      def adopt
        described_class.perform_now([listing.id], adopting_course,
                                    adopting_course.assessment_categories.first.tabs.first.id,
                                    current_user: user)
        adopting_course.assessments.order(:created_at).last
      end

      context 'when duplicating selected objects' do
        it 'records the destination course as an adopter of the same listing' do
          adopted = adopt
          onward_destination = create(:course)
          copy = nil

          expect do
            copy = Course::Duplication::ObjectDuplicationService.duplicate_objects(
              adopting_course, onward_destination, adopted, current_user: user
            )
          end.to change { listing.reload.adoption_count }.from(1).to(2)

          adoption = Course::Assessment::Marketplace::Adoption.
                     find_by(duplicated_assessment_id: copy.id)
          expect(adoption.listing).to eq(listing)
          expect(adoption.destination_course).to eq(onward_destination)
          # The vintage its source held, so the copy is told it is behind once a newer version lands.
          expect(adoption.adopted_version_at).
            to be_within(1.second).of(listing.current_version.published_at)
        end
      end

      context 'when duplicating the whole course' do
        it 'records the new course as an adopter of the same listing' do
          adopt

          new_course = nil
          expect do
            new_course = Course::Duplication::CourseDuplicationService.duplicate_course(
              adopting_course, current_user: user, new_title: "#{adopting_course.title} copy"
            )
          end.to change { listing.reload.adoption_count }.from(1).to(2)

          adoption = Course::Assessment::Marketplace::Adoption.
                     find_by(destination_course_id: new_course.id)
          expect(adoption.listing).to eq(listing)
        end
      end
    end
  end
end
