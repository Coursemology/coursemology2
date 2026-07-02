# frozen_string_literal: true
class Course::Gradebook::LevelConfig < ApplicationRecord # rubocop:disable Metrics/ClassLength
  belongs_to :course, inverse_of: :gradebook_level_config

  validates :weight, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :formula, presence: true, if: :enabled
  validates :course_id, uniqueness: true
  validate :formula_ast_structure
  validate :enabled_formula_must_parse

  # Upserts the singleton Level config for a course from a normalized attrs hash
  # (symbol keys, snake_case). Raises ActiveRecord::RecordInvalid on validation failure.
  def self.upsert_for(course:, attrs:)
    config = find_or_initialize_by(course_id: course.id)
    config.assign_attributes(
      enabled: ActiveRecord::Type::Boolean.new.cast(attrs[:enabled]),
      formula: attrs[:formula].to_s,
      formula_ast: attrs[:formula_ast],
      weight: attrs[:weight].to_f,
      show: ActiveRecord::Type::Boolean.new.cast(attrs[:show]) == true,
      clamp: attrs.key?(:clamp) ? ActiveRecord::Type::Boolean.new.cast(attrs[:clamp]) : true
    )
    config.save!
    config
  end

  def evaluate_for(level:)
    return nil unless enabled && formula_ast.present?

    result = evaluate_node(formula_ast, level.to_f)
    return nil unless result.is_a?(Numeric) && result.finite?

    value = result.to_f
    clamp ? value.clamp(0.0, weight.to_f) : value
  rescue StandardError
    nil
  end

  BINOPS = %w[+ - * /].freeze
  CALL1_FNS = %w[floor ceil round].freeze
  CALL2_FNS = %w[min max].freeze

  def self.valid_ast?(node, depth = 0)
    return false if depth > 20
    return false unless node.is_a?(Hash) && node['type'].is_a?(String)

    valid_node_type?(node, depth)
  end

  def self.valid_node_type?(node, depth)
    case node['type']
    when 'num' then node['value'].is_a?(Numeric)
    when 'var' then node['name'] == 'level'
    when 'neg' then valid_operand?(node, 'operand', depth)
    when 'binop' then valid_binop?(node, depth)
    when 'call1' then valid_call1?(node, depth)
    when 'call2' then valid_call2?(node, depth)
    else false
    end
  end

  def self.valid_operand?(node, key, depth)
    node.key?(key) && valid_ast?(node[key], depth + 1)
  end

  def self.valid_binop?(node, depth)
    BINOPS.include?(node['op']) &&
      valid_operand?(node, 'left', depth) &&
      valid_operand?(node, 'right', depth)
  end

  def self.valid_call1?(node, depth)
    CALL1_FNS.include?(node['fn']) && valid_operand?(node, 'arg', depth)
  end

  def self.valid_call2?(node, depth)
    CALL2_FNS.include?(node['fn']) &&
      valid_operand?(node, 'a', depth) &&
      valid_operand?(node, 'b', depth)
  end
  private_class_method :valid_node_type?, :valid_operand?, :valid_binop?, :valid_call1?, :valid_call2?

  private

  def formula_ast_structure
    return if formula_ast.blank?

    errors.add(:formula_ast, 'has an invalid structure') unless self.class.valid_ast?(formula_ast)
  end

  # An enabled contribution must carry a usable parse. formula_ast is derived client-side
  # (there is no server-side parser), so a present formula with a blank ast means the formula
  # did not parse — reject it on :formula (the field the user edits) rather than silently
  # persisting an enabled config that evaluate_for returns nil for. The blank-formula case is
  # already covered by the presence validation above, so guard on formula.present? to avoid a
  # duplicate error.
  def enabled_formula_must_parse
    return unless enabled && formula.present?

    errors.add(:formula, 'could not be parsed') if formula_ast.blank?
  end

  def evaluate_node(node, level)
    case node['type']
    when 'num'   then node['value'].to_f
    when 'var'   then level
    when 'neg'   then -evaluate_node(node['operand'], level)
    when 'binop' then evaluate_binop(node, level)
    when 'call1' then evaluate_call1(node, level)
    when 'call2' then evaluate_call2(node, level)
    end
  end

  def evaluate_binop(node, level)
    l = evaluate_node(node['left'], level)
    r = evaluate_node(node['right'], level)
    case node['op']
    when '+' then l + r
    when '-' then l - r
    when '*' then l * r
    when '/' then (r == 0) ? Float::NAN : l / r
    end
  end

  def evaluate_call1(node, level)
    a = evaluate_node(node['arg'], level)
    case node['fn']
    when 'floor' then a.floor.to_f
    when 'ceil'  then a.ceil.to_f
    when 'round' then a.round.to_f
    end
  end

  def evaluate_call2(node, level)
    a = evaluate_node(node['a'], level)
    b = evaluate_node(node['b'], level)
    (node['fn'] == 'min') ? [a, b].min : [a, b].max
  end
end
