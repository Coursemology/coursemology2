require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::Preview do
  let(:instance) { create(:instance) }
  around { |ex| ActsAsTenant.with_tenant(instance) { ex.run } }

  let(:course) { create(:course, instance: instance) }
  let(:course_user) { create(:course_manager, course: course) }
  let(:assessment) { create(:assessment, course: course) }
  let(:listing) do
    src = create(:assessment, course: course)
    create(:course_assessment_marketplace_listing, assessment: src)
  end

  it 'associates listing, course_user and assessment' do
    preview = described_class.create!(listing: listing, course_user: course_user, assessment: assessment)
    expect(preview.listing).to eq(listing)
    expect(preview.course_user).to eq(course_user)
    expect(preview.assessment).to eq(assessment)
  end

  it 'is unique per (listing, course_user)' do
    described_class.create!(listing: listing, course_user: course_user, assessment: assessment)
    dup = described_class.new(listing: listing, course_user: course_user,
                              assessment: create(:assessment, course: course))
    expect(dup).not_to be_valid
  end

  it '.for returns the marker for a listing and course_user' do
    preview = described_class.create!(listing: listing, course_user: course_user, assessment: assessment)
    expect(described_class.for(listing, course_user)).to eq(preview)
  end
end