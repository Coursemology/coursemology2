# frozen_string_literal: true
# Checks the paths of the files in a programming question or answer, such as +templates/index.html+.
#
# A bad path is rejected rather than rewritten, so the name a user sees is the name that is stored. The
# client applies the same rules first, so a failure here is not expected to reach users.
module Course::Assessment::ProgrammingFilePath
  # The evaluator packs files into a tar with Gem::Package::TarWriter, which only supports the ustar name
  # fields: at most 100 bytes after the last split and 155 bytes before it. Each segment fits the first.
  MAX_SEGMENT_BYTES = 100

  # The folder part fits the 155-byte prefix, less the 19 bytes of +package/submission/+, the longest
  # folder the package puts in front of a file.
  MAX_FOLDER_BYTES = 136

  # Raised when a file being saved has a path that breaks these rules.
  class InvalidPathError < StandardError; end

  module_function

  # Finds the first rule a path breaks.
  #
  # @param [String] path The path, relative to its folder in the package.
  # @return [Symbol, nil] +:invalid+ or +:too_long+, or nil when the path is valid.
  def error(path)
    return :invalid unless path.is_a?(String) && path.valid_encoding? && !path.empty?
    return :invalid if path.include?('\\')

    segments = path.split('/', -1)
    return :invalid unless segments.all? { |segment| valid_segment?(segment) }

    too_long?(segments) ? :too_long : nil
  end

  # Finds the first rule that new paths break, among themselves or with the paths of existing files,
  # after each new path is checked by {.error}. Clashes among the existing paths alone are not
  # reported, so files saved before these rules don't block a save.
  #
  # @param [Array<String>] paths The paths of the files being added.
  # @param [Array<String>] existing The paths of the files already in the same folder of the package.
  # @return [Symbol, nil] +:duplicate+ when two paths differ only in case, +:file_folder_clash+ when a
  #   file has the same path as a folder, or nil when the paths are valid together.
  def collection_error(paths, existing = [])
    keys = paths.map(&:downcase)
    existing_keys = existing.to_set(&:downcase)
    return :duplicate if keys.uniq.size != keys.size || existing_keys.intersect?(keys.to_set)

    new_folders = keys.flat_map { |key| folders_of(key) }.to_set
    existing_folders = existing_keys.flat_map { |key| folders_of(key) }.to_set
    :file_folder_clash if new_folders.intersect?(existing_keys | keys) || existing_folders.intersect?(keys.to_set)
  end

  # A segment is valid when Pathname.normalize_filename would leave it unchanged, which also rejects
  # empty, +.+ and +..+ segments.
  def valid_segment?(segment)
    !segment.match?(/[[:cntrl:]]/) && Pathname.normalize_filename(segment) == segment && !segment.empty?
  end

  def too_long?(segments)
    segments.any? { |segment| segment.bytesize > MAX_SEGMENT_BYTES } ||
      segments[0...-1].join('/').bytesize > MAX_FOLDER_BYTES
  end

  # @return [Array<String>] Each folder the path is in, such as +a+ and +a/b+ for +a/b/c+.
  def folders_of(path)
    segments = path.split('/')
    (1...segments.size).map { |count| segments.first(count).join('/') }
  end

  private_class_method :valid_segment?, :too_long?, :folders_of
end
