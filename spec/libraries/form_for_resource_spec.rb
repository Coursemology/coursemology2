# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: form_for with resource', type: :view do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    it 'does not allow :url to be used with :resource' do
      expect do
        form_for(build(:course), resource: :course, url: courses_path) {}
      end.to raise_error(ArgumentError)
    end

    it 'requires :resource to be a symbol' do
      expect do
        form_for(build(:course), resource: 'course') {}
      end.to raise_error(ArgumentError)
    end

    it 'automatically adds the `path` suffix for route helpers' do
      expect(form_for(build(:course), resource: :course) {}).to have_form(courses_path, :post)
    end

    context 'when the resource is new' do
      subject { form_for(build(:course), resource: :course_path) {} }
      it 'generates the plural route' do
        expect(subject).to have_form(courses_path, :post)
      end
    end

    context 'when the resource is persisted' do
      let(:course) { create(:course) }
      subject { form_for(course, resource: :course_path) {} }
      it 'generates the singular route' do
        expect(subject).to have_form(course_path(course), :post)
      end
    end
  end
end
