/* eslint-disable no-undef */
// This ArrayInput implementation is only used for the creation of
// multiple solution words (keywords / lifted words) in the
// TextResponseComprehensionSolution model,
// for the purpose of MVP testing and will be replaced with a
// more intuitive input method (e.g. the tokens for Skills) soon.
$(() => {
  function replaceBracketWithUnderscore(string) {
    return string.replace(/[[\]']/g, '_');
  }

  function replaceBracketFromComprehensionAttributes() {
    if (document.getElementsByClassName('table-comprehension').length === 0)
      return; // do nothing if not comprehension question

    const addFields = $('.table-comprehension a.add_fields');
    addFields.each((index) => {
      addFields[index].setAttribute(
        'data-association-insertion-node',
        replaceBracketWithUnderscore(
          addFields[index].getAttribute('data-association-insertion-node'),
        ),
      );
    });

    const tbody = $('.table-comprehension tbody');
    const tdSolution = $('.table-comprehension td.td-solution');
    const aSolutionButton = $('.table-comprehension a.solution-button');
    const tableElements = jQuery.merge(
      jQuery.merge(tbody, tdSolution),
      aSolutionButton,
    );
    tableElements.each((index) => {
      tableElements[index].className = replaceBracketWithUnderscore(
        tableElements[index].className,
      );
    });
  }

  function addSolutionField(event) {
    event.preventDefault();
    const thisClassNameArr = this.className.split(' ');
    const thisClassNameLast = thisClassNameArr[thisClassNameArr.length - 1];
    const tdToFind = `td.${thisClassNameLast}`;
    $lastSolutionField = $(`${tdToFind} input:last-of-type`).clone();
    $lastSolutionField.val('');
    $(`${tdToFind} div.form-group input:last-of-type`).after(
      $lastSolutionField,
    );
  }

  replaceBracketFromComprehensionAttributes();
  $('a.solution-button').on('click', addSolutionField);

  $('.table-comprehension').on('cocoon:after-insert', (e, node) => {
    replaceBracketFromComprehensionAttributes();
    node
      .find('td.td-solution-button a.solution-button')
      .on('click', addSolutionField);
  });
});
