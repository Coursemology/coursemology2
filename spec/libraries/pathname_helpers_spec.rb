# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Pathname' do
  describe '.normalize_filename' do
    subject { Pathname.normalize_filename(filename) }
    context 'when the filename has illegal characters' do
      let(:filename) { 'lol"|/\?*<>:lol' }
      it { is_expected.to eq('lol lol') }
    end

    context 'when the filename has trailing dots' do
      let(:filename) { 'lol..' }
      it { is_expected.to eq('lol') }
    end

    context 'when the filename has extra whitespaces' do
      let(:filename) { 'lol  lol  ' }
      it { is_expected.to eq('lol lol') }
    end
  end

  describe '.normalize_path' do
    subject { Pathname.normalize_path(path) }

    context 'when the path has back slashes' do
      let(:path) { 'lol\lol/lol' }
      it { is_expected.to eq('lol/lol/lol') }
    end

    context 'when the path has adjacent slashes' do
      let(:path) { 'lol//lol' }
      it { is_expected.to eq('lol/lol') }
    end

    context 'when the path has illegal characters' do
      let(:path) { 'lol*?/lol.' }
      it { is_expected.to eq('lol/lol') }
    end
  end
end
