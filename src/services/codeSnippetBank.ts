export interface CodeSnippetQuestion {
  id: string;
  language: 'C' | 'Python';
  title: string;
  topic: string;
  code: string;
  questionPrompt: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

export const CODE_SNIPPETS_POOL: CodeSnippetQuestion[] = [
  // ==========================================
  // C LANGUAGE BEGINNER SNIPPETS (10)
  // ==========================================
  {
    id: 'c_sum_5',
    language: 'C',
    title: 'For Loop Sum Accumulator',
    topic: 'Loops & Arithmetic',
    code: `#include <stdio.h>

int main() {
    int sum = 0;
    for (int i = 1; i <= 5; i++) {
        sum += i;
    }
    printf("%d", sum);
    return 0;
}`,
    questionPrompt: 'What value will be printed to stdout by printf("%d", sum)?',
    correctAnswer: '15',
    options: ['15', '10', '20', '25'],
    explanation: 'The loop adds 1 + 2 + 3 + 4 + 5 = 15.',
  },
  {
    id: 'c_even_count',
    language: 'C',
    title: 'Even Numbers Counter',
    topic: 'Conditionals & Modulo',
    code: `#include <stdio.h>

int main() {
    int count = 0;
    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) {
            count++;
        }
    }
    printf("%d", count);
    return 0;
}`,
    questionPrompt: 'What integer will be printed to stdout?',
    correctAnswer: '5',
    options: ['5', '4', '10', '6'],
    explanation: 'Even numbers between 1 and 10 are 2, 4, 6, 8, 10 (total 5 numbers).',
  },
  {
    id: 'c_while_double',
    language: 'C',
    title: 'While Loop Doubler',
    topic: 'While Loops',
    code: `#include <stdio.h>

int main() {
    int x = 1;
    while (x < 20) {
        x *= 2;
    }
    printf("%d", x);
    return 0;
}`,
    questionPrompt: 'What value is printed after the while loop terminates?',
    correctAnswer: '32',
    options: ['32', '16', '20', '64'],
    explanation: 'x starts at 1 and doubles: 1 -> 2 -> 4 -> 8 -> 16 -> 32. At 32, (x < 20) becomes false.',
  },
  {
    id: 'c_ternary',
    language: 'C',
    title: 'Ternary Operator Evaluation',
    topic: 'Ternary Operator',
    code: `#include <stdio.h>

int main() {
    int a = 12, b = 25;
    int max = (a > b) ? a : b;
    int result = max + 5;
    printf("%d", result);
    return 0;
}`,
    questionPrompt: 'What is the output printed to stdout?',
    correctAnswer: '30',
    options: ['30', '25', '17', '37'],
    explanation: 'Since 12 > 25 is false, max is 25. Then result = 25 + 5 = 30.',
  },
  {
    id: 'c_array_sum',
    language: 'C',
    title: 'Array Elements Total',
    topic: 'Arrays & Indexing',
    code: `#include <stdio.h>

int main() {
    int arr[] = {3, 7, 2, 8};
    int total = 0;
    for (int i = 0; i < 4; i++) {
        total += arr[i];
    }
    printf("%d", total);
    return 0;
}`,
    questionPrompt: 'What value is stored in total and printed?',
    correctAnswer: '20',
    options: ['20', '18', '22', '16'],
    explanation: 'Sum of array elements: 3 + 7 + 2 + 8 = 20.',
  },
  {
    id: 'c_post_inc',
    language: 'C',
    title: 'Post-Increment Operator',
    topic: 'Operators & Precedence',
    code: `#include <stdio.h>

int main() {
    int a = 5;
    int b = a++;
    int total = a + b;
    printf("%d", total);
    return 0;
}`,
    questionPrompt: 'What value does printf output?',
    correctAnswer: '11',
    options: ['11', '10', '12', '15'],
    explanation: 'With post-increment (a++), b receives 5 first, then a becomes 6. 6 + 5 = 11.',
  },
  {
    id: 'c_modulo_calc',
    language: 'C',
    title: 'Modulo & Operator Precedence',
    topic: 'Arithmetic Precedence',
    code: `#include <stdio.h>

int main() {
    int val = (17 % 5) * 4 + 2;
    printf("%d", val);
    return 0;
}`,
    questionPrompt: 'What is the evaluated integer output?',
    correctAnswer: '10',
    options: ['10', '8', '12', '14'],
    explanation: '17 % 5 = 2. Then 2 * 4 = 8. Finally 8 + 2 = 10.',
  },
  {
    id: 'c_countdown',
    language: 'C',
    title: 'Countdown Loop Step Counter',
    topic: 'Loop Invariants',
    code: `#include <stdio.h>

int main() {
    int n = 10;
    int steps = 0;
    while (n > 1) {
        n -= 3;
        steps++;
    }
    printf("%d", steps);
    return 0;
}`,
    questionPrompt: 'How many steps are executed and printed?',
    correctAnswer: '3',
    options: ['3', '4', '2', '5'],
    explanation: 'n goes 10 -> 7 (step 1) -> 4 (step 2) -> 1 (step 3). At n=1, condition n > 1 fails. steps = 3.',
  },
  {
    id: 'c_char_ascii',
    language: 'C',
    title: 'Character ASCII Arithmetic',
    topic: 'Char Type & ASCII',
    code: `#include <stdio.h>

int main() {
    char ch = 'A';
    ch += 3;
    printf("%c", ch);
    return 0;
}`,
    questionPrompt: 'What character is printed by printf("%c", ch)?',
    correctAnswer: 'D',
    options: ['D', 'C', 'E', '68'],
    explanation: "'A' + 3 shifts 3 characters forward: A -> B -> C -> D.",
  },
  {
    id: 'c_switch_case',
    language: 'C',
    title: 'Switch Case Branching',
    topic: 'Control Flow',
    code: `#include <stdio.h>

int main() {
    int code = 2;
    int points = 10;
    switch (code) {
        case 1: points += 5; break;
        case 2: points += 15; break;
        default: points = 0;
    }
    printf("%d", points);
    return 0;
}`,
    questionPrompt: 'What is the final value of points?',
    correctAnswer: '25',
    options: ['25', '10', '15', '30'],
    explanation: 'code is 2, so case 2 matches: points = 10 + 15 = 25.',
  },

  // ==========================================
  // PYTHON 3 BEGINNER SNIPPETS (10)
  // ==========================================
  {
    id: 'py_range_step',
    language: 'Python',
    title: 'Range with Step Parameter',
    topic: 'For Loops & Range',
    code: `total = 0
for i in range(1, 10, 2):
    total += i

print(total)`,
    questionPrompt: 'What will print(total) output to console?',
    correctAnswer: '25',
    options: ['25', '20', '30', '45'],
    explanation: 'range(1, 10, 2) yields odd numbers: 1, 3, 5, 7, 9. Sum = 1 + 3 + 5 + 7 + 9 = 25.',
  },
  {
    id: 'py_list_len',
    language: 'Python',
    title: 'List Append & Length',
    topic: 'Lists & Methods',
    code: `fruits = ["apple", "banana", "cherry"]
fruits.append("orange")
fruits.append("mango")

print(len(fruits))`,
    questionPrompt: 'What is the final length of the fruits list?',
    correctAnswer: '5',
    options: ['5', '3', '4', '6'],
    explanation: 'Starts with 3 items, appends 2 items. len(fruits) = 5.',
  },
  {
    id: 'py_string_slice',
    language: 'Python',
    title: 'String Slicing Substring',
    topic: 'String Slicing',
    code: `msg = "Freshers2026"
sub = msg[0:5]

print(sub)`,
    questionPrompt: 'What substring is printed?',
    correctAnswer: 'Fresh',
    options: ['Fresh', 'Freshe', 'Freshers', '2026'],
    explanation: 'msg[0:5] extracts characters at indices 0, 1, 2, 3, 4 which is "Fresh".',
  },
  {
    id: 'py_list_comp',
    language: 'Python',
    title: 'List Comprehension Doubler',
    topic: 'List Comprehension',
    code: `nums = [2, 4, 6]
doubled = [x * 2 for x in nums]

print(sum(doubled))`,
    questionPrompt: 'What does print(sum(doubled)) output?',
    correctAnswer: '24',
    options: ['24', '12', '18', '30'],
    explanation: 'doubled = [4, 8, 12]. sum([4, 8, 12]) = 24.',
  },
  {
    id: 'py_dict_lookup',
    language: 'Python',
    title: 'Dictionary Key Lookup',
    topic: 'Dictionaries',
    code: `score_map = {"C": 10, "Python": 25, "Java": 15}
bonus = 5
total = score_map["Python"] + bonus

print(total)`,
    questionPrompt: 'What is printed to console?',
    correctAnswer: '30',
    options: ['30', '25', '20', '35'],
    explanation: 'score_map["Python"] is 25. 25 + 5 = 30.',
  },
  {
    id: 'py_func_call',
    language: 'Python',
    title: 'Function Definition & Return',
    topic: 'Functions',
    code: `def calc(x, y):
    return (x + y) * 2

res = calc(4, 6)
print(res)`,
    questionPrompt: 'What is the returned value printed?',
    correctAnswer: '20',
    options: ['20', '16', '24', '10'],
    explanation: 'calc(4, 6) evaluates (4 + 6) * 2 = 10 * 2 = 20.',
  },
  {
    id: 'py_str_mult',
    language: 'Python',
    title: 'String Repetition Operator',
    topic: 'Strings & Operators',
    code: `word = "Go"
result = word * 3 + "!"

print(result)`,
    questionPrompt: 'What string does print(result) display?',
    correctAnswer: 'GoGoGo!',
    options: ['GoGoGo!', 'Go 3!', 'GoGo!', 'GoGoGo'],
    explanation: '"Go" * 3 repeats "Go" 3 times: "GoGoGo". Appending "!" yields "GoGoGo!".',
  },
  {
    id: 'py_while_loop',
    language: 'Python',
    title: 'While Loop Step Accumulator',
    topic: 'While Loops',
    code: `counter = 0
num = 1
while num <= 7:
    counter += num
    num += 2

print(counter)`,
    questionPrompt: 'What is the final value of counter?',
    correctAnswer: '16',
    options: ['16', '15', '18', '20'],
    explanation: 'num takes values 1, 3, 5, 7. counter = 1 + 3 + 5 + 7 = 16.',
  },
  {
    id: 'py_max_min',
    language: 'Python',
    title: 'Max and Min Range Spread',
    topic: 'Built-in Functions',
    code: `scores = [45, 88, 72, 95, 60]
top = max(scores) - min(scores)

print(top)`,
    questionPrompt: 'What integer difference is printed?',
    correctAnswer: '50',
    options: ['50', '45', '95', '55'],
    explanation: 'max(scores) = 95, min(scores) = 45. 95 - 45 = 50.',
  },
  {
    id: 'py_reverse_slice',
    language: 'Python',
    title: 'String Reverse Slice',
    topic: 'String Slicing Step',
    code: `text = "TECH"
rev = text[::-1]

print(rev)`,
    questionPrompt: 'What is the reversed string?',
    correctAnswer: 'HCET',
    options: ['HCET', 'TECH', 'HET', 'CETH'],
    explanation: 'text[::-1] steps backward through "TECH", yielding "HCET".',
  },
];

// Returns 'count' randomly selected code tests with a balanced mix of C & Python
export const getRandomCodeTests = (count: number = 3): CodeSnippetQuestion[] => {
  const cQuestions = CODE_SNIPPETS_POOL.filter((q) => q.language === 'C');
  const pyQuestions = CODE_SNIPPETS_POOL.filter((q) => q.language === 'Python');

  // Shuffle both arrays
  const shuffledC = [...cQuestions].sort(() => Math.random() - 0.5);
  const shuffledPy = [...pyQuestions].sort(() => Math.random() - 0.5);

  const selected: CodeSnippetQuestion[] = [];

  // Pick at least 1 C and 1 Python, then fill remaining randomly
  if (shuffledC.length > 0) selected.push(shuffledC.pop()!);
  if (shuffledPy.length > 0) selected.push(shuffledPy.pop()!);

  const remainingPool = [...shuffledC, ...shuffledPy].sort(() => Math.random() - 0.5);

  while (selected.length < count && remainingPool.length > 0) {
    selected.push(remainingPool.pop()!);
  }

  // Final shuffle of the selected questions so languages appear in random order
  return selected.sort(() => Math.random() - 0.5);
};
