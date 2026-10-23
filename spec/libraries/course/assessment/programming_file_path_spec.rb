# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingFilePath do
  # The client tests the same cases, so keep the two tables in step.
  self::PATH_CASES = {
    'main.py' => nil,
    'templates/index.html' => nil,
    'static/css/style.css' => nil,
    '.gitignore' => nil,
    'my file.py' => nil,
    'données/café.txt' => nil,
    '' => :invalid,
    '/main.py' => :invalid,
    'main.py/' => :invalid,
    'a//b.py' => :invalid,
    './main.py' => :invalid,
    '../main.py' => :invalid,
    'a/../b.py' => :invalid,
    'a\\b.py' => :invalid,
    'a?.py' => :invalid,
    'a*.py' => :invalid,
    'a:b.py' => :invalid,
    'a|b.py' => :invalid,
    'a"b.py' => :invalid,
    'a<b>.py' => :invalid,
    ' main.py' => :invalid,
    'main.py ' => :invalid,
    'my  file.py' => :invalid,
    "my\tfile.py" => :invalid,
    "main\u0000.py" => :invalid,
    'main.' => :invalid,
    'folder./main.py' => :invalid,
    'a' * 100 => nil,
    'a' * 101 => :too_long,
    # Each of these characters is 3 bytes in UTF-8.
    '字' * 33 => nil,
    '字' * 34 => :too_long,
    "#{'d' * 67}/#{'d' * 68}/main.py" => nil,
    "#{'d' * 68}/#{'d' * 68}/main.py" => :too_long,
    "#{'a/' * 68}main.py" => nil,
    "#{'a/' * 69}main.py" => :too_long
  }.freeze

  describe '.error' do
    self::PATH_CASES.each do |path, expected|
      it "returns #{expected.inspect} for #{path.inspect.truncate(40)}" do
        expect(described_class.error(path)).to eq(expected)
      end
    end

    it 'rejects a path that is not valid UTF-8' do
      expect(described_class.error("caf\xE9.py".b.force_encoding('UTF-8'))).to eq(:invalid)
    end

    it 'rejects a path that is not a string' do
      expect(described_class.error(nil)).to eq(:invalid)
    end
  end

  describe '.collection_error' do
    it 'accepts distinct paths' do
      expect(described_class.collection_error(['main.py', 'templates/index.html', 'templates/base.html'])).
        to be_nil
    end

    it 'rejects paths that differ only in case' do
      expect(described_class.collection_error(['Main.py', 'main.py'])).to eq(:duplicate)
    end

    it 'rejects a file with the same path as a folder' do
      expect(described_class.collection_error(['templates', 'templates/index.html'])).to eq(:file_folder_clash)
    end

    it 'rejects a file with the same path as a folder in another case' do
      expect(described_class.collection_error(['Templates', 'templates/index.html'])).to eq(:file_folder_clash)
    end

    it 'accepts folders that share a prefix with a file' do
      expect(described_class.collection_error(['temp', 'templates/index.html'])).to be_nil
    end
  end
end
