# frozen_string_literal: true
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  include ApplicationUserstampConcern
  include ApplicationActsAsConcern

  # Builds the raw SQL expression behind a `calculated_attributes` attribute, for use in `order`.
  #
  # Ordering by the *alias* (`order('average_achievement_count DESC')`) only works while the
  # aliased projection survives in the relation's select list. That is not guaranteed:
  # `calculated_attributes` v1.2.0 wipes `select_values` in place inside `Relation#calculate`, so
  # any `count` on the relation (`each_cons` and Bullet both trigger one) leaves an ORDER BY
  # referencing a column that is no longer selected — `PG::UndefinedColumn`.
  #
  # Ordering by the expression instead is self-contained, and costs nothing: PostgreSQL emits an
  # identical plan either way, reusing the same `SubPlan` for the select-list and sort-key copies
  # (verified with EXPLAIN — byte-identical plans).
  #
  # Derives the expression from the same lambda that defines the projection, so the two cannot
  # drift apart.
  #
  # Mirrors the resolution and normalisation that `calculated_attributes` itself performs in
  # `ActiveRecord::Relation#calculated` (`model_methods.rb`), so the ORDER BY expression and the
  # SELECT projection are always built the same way:
  #   - falls back to `base_class` for MTI/STI models, as the gem does;
  #   - forwards `*args`, since attributes may be parameterised
  #     (e.g. `calculated :topic_unread_count, ->(user) { ... }` in `Course::Forum`);
  #   - accepts every shape a lambda may return — a relation, a raw SQL string, a
  #     `sanitize_sql` array, or a bare Arel node.
  #
  # @param [Symbol] attribute The calculated attribute name.
  # @param [Array] args Arguments for a parameterised attribute, forwarded to its lambda.
  # @return [Arel::Nodes::Node] An expression suitable for `order`.
  # @raise [ArgumentError] If the attribute is not defined on this model or its base class.
  def self.calculated_expression(attribute, *)
    calculated_expression_to_arel(calculated_attribute_lambda(attribute).call(*))
  end

  # Resolves a calculated attribute's lambda, falling back to +base_class+ for MTI/STI models the
  # way the gem does. Fails loudly rather than letting a typo surface as +NoMethodError+ on +nil+.
  def self.calculated_attribute_lambda(attribute)
    calculated.calculated[attribute] || base_class.calculated.calculated[attribute] ||
      raise(ArgumentError, "#{name} has no calculated attribute #{attribute.inspect}")
  end
  private_class_method :calculated_attribute_lambda

  # Normalises whatever a calculated lambda returns into an Arel expression, matching the gem's own
  # handling: a +sanitize_sql+ array, a raw SQL string, a relation, or an Arel node.
  def self.calculated_expression_to_arel(sql)
    # NB: the array is passed whole, not splatted. The gem's own copy of this does
    # `send(:sanitize_sql, *sql)`, which hands `['... ?', value]` to a one-argument method and
    # raises. `sanitize_sql(condition)` expects the array itself.
    sql = send(:sanitize_sql, sql) if sql.is_a?(Array)
    return Arel.sql("(#{sql})") if sql.is_a?(String)
    return Arel.sql("(#{sql.to_sql})") if sql.respond_to?(:to_sql)

    sql
  end
  private_class_method :calculated_expression_to_arel
end
