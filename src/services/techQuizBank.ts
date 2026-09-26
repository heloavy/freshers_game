export interface TechQuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface TechQuizQuestion {
  id: string;
  category: 'HARDWARE' | 'NETWORKING' | 'LOGIC & BINARY' | 'GIT & DEV' | 'PROGRAMMING' | 'WEB TECH' | 'OS & CLI';
  categoryLabel: string;
  categoryColor: string;
  title: string;
  scenario: string;
  codeSnippet?: string;
  codeLanguage?: string;
  options: TechQuizOption[];
  explanation: string;
  hint: string;
  difficulty: 'Beginner' | 'Elementary' | 'Novice';
}

export const TECH_QUIZ_POOL: TechQuizQuestion[] = [
  {
    id: 'tq-01',
    category: 'HARDWARE',
    categoryLabel: 'Hardware & Architecture',
    categoryColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    title: 'The Volatile Memory Mystery',
    scenario: 'You are writing code in the lab when the power cord accidentally disconnects and the laptop dies immediately. When rebooted, your unsaved text buffers inside this component are completely lost, while saved files on the SSD remained safe. Which high-speed volatile component lost its data?',
    options: [
      { id: 'a', label: 'RAM (Random Access Memory)', isCorrect: true },
      { id: 'b', label: 'CPU Instruction Cache', isCorrect: false },
      { id: 'c', label: 'BIOS Flash ROM chip', isCorrect: false },
      { id: 'd', label: 'GPU Tensor Core', isCorrect: false },
    ],
    explanation: 'RAM is volatile semiconductor memory that requires continuous electric power to retain stored bits.',
    hint: 'This component is measured in GB (e.g. 8GB or 16GB) and sits in slots beside the CPU heatsink.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-02',
    category: 'LOGIC & BINARY',
    categoryLabel: 'Binary & Bitwise Logic',
    categoryColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    title: 'Bitshift Multiplier',
    scenario: 'A microcontroller register holds the 4-bit binary value 0b0101 (decimal 5). The ALU executes a single logical left bitshift operation (<< 1). What is the resulting decimal value stored in the register?',
    options: [
      { id: 'a', label: '10 (binary 1010)', isCorrect: true },
      { id: 'b', label: '6 (binary 0110)', isCorrect: false },
      { id: 'c', label: '2 (binary 0010)', isCorrect: false },
      { id: 'd', label: '25 (binary 11001)', isCorrect: false },
    ],
    explanation: 'Each left bitshift by 1 position effectively multiplies the binary integer by 2: 5 * 2 = 10 (0b1010).',
    hint: 'Shifting bits to the left adds a zero on the right, which doubles the number in base 2.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-03',
    category: 'NETWORKING',
    categoryLabel: 'Networking & Web',
    categoryColor: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    title: 'The Secure Handshake',
    scenario: 'When logging into your college portal, the URL bar indicates https:// alongside a green padlock icon instead of standard http://. Which cryptographic security protocol encrypts the communication channel between client and server?',
    options: [
      { id: 'a', label: 'TLS / SSL (Transport Layer Security)', isCorrect: true },
      { id: 'b', label: 'FTP (File Transfer Protocol)', isCorrect: false },
      { id: 'c', label: 'SMTP (Simple Mail Protocol)', isCorrect: false },
      { id: 'd', label: 'BGP (Border Gateway Protocol)', isCorrect: false },
    ],
    explanation: 'HTTPS uses TLS (previously SSL) to encrypt HTTP packets over TCP port 443.',
    hint: 'Look for the "S" in HTTPS — it stands for Secure and relies on cryptographic certificates.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-04',
    category: 'PROGRAMMING',
    categoryLabel: 'Data Structures',
    categoryColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    title: 'The Cafeteria Tray Principle',
    scenario: 'Which linear data structure enforces the strict LIFO (Last-In, First-Out) rule—where the most recently pushed element must be the first one popped, exactly like a stack of trays in a cafeteria or a browser back button history?',
    options: [
      { id: 'a', label: 'Stack', isCorrect: true },
      { id: 'b', label: 'Queue', isCorrect: false },
      { id: 'c', label: 'Circular Linked List', isCorrect: false },
      { id: 'd', label: 'Binary Search Tree', isCorrect: false },
    ],
    explanation: 'A Stack operates strictly as Last-In First-Out (LIFO) through push() and pop() operations.',
    hint: 'It shares its name with what happens when you pile physical books or plates on top of each other.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-05',
    category: 'GIT & DEV',
    categoryLabel: 'Git & Version Control',
    categoryColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    title: 'Working Tree Diagnostic',
    scenario: 'You are working on a team project and want to see which files have been modified, untracked, or staged before committing your code. Which fundamental Git command prints this working tree status?',
    options: [
      { id: 'a', label: 'git status', isCorrect: true },
      { id: 'b', label: 'git commit -m "update"', isCorrect: false },
      { id: 'c', label: 'git push --all', isCorrect: false },
      { id: 'd', label: 'git init --force', isCorrect: false },
    ],
    explanation: 'git status displays paths that have differences between the index file and the current HEAD commit.',
    hint: 'The command literally asks Git for the current "status" of your repository files.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-06',
    category: 'LOGIC & BINARY',
    categoryLabel: 'Boolean Logic Circuits',
    categoryColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    title: 'The Dual-Key Air-Lock',
    scenario: 'A laboratory airlock requires TWO physical keys to be turned at the exact same time. If Key A is turned (1) AND Key B is turned (1), the door unlocks (1). If either key is missing (0), the door remains shut (0). Which elementary logic gate represents this circuit?',
    options: [
      { id: 'a', label: 'AND Gate', isCorrect: true },
      { id: 'b', label: 'OR Gate', isCorrect: false },
      { id: 'c', label: 'XOR Gate', isCorrect: false },
      { id: 'd', label: 'NOT Gate', isCorrect: false },
    ],
    explanation: 'An AND gate outputs 1 (true) if and only if all of its input terminals receive 1.',
    hint: 'Both inputs must be active together — Key 1 "AND" Key 2.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-07',
    category: 'PROGRAMMING',
    categoryLabel: 'C & Compiler Fundamentals',
    categoryColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    title: 'The Missing Sentinel',
    scenario: 'A student writes their first program in C/C++/Java, but the compiler halts with error: expected \';\' before \'}\' token. In these compiled languages, which punctuation character is mandatory at the end of every executable statement?',
    options: [
      { id: 'a', label: 'Semicolon (;)', isCorrect: true },
      { id: 'b', label: 'Colon (:)', isCorrect: false },
      { id: 'c', label: 'Period (.)', isCorrect: false },
      { id: 'd', label: 'Hash sign (#)', isCorrect: false },
    ],
    explanation: 'In C, C++, Java, and Rust, the semicolon (;) serves as the statement terminator.',
    hint: 'It is a comma topped with a period: ";".',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-08',
    category: 'OS & CLI',
    categoryLabel: 'Operating Systems',
    categoryColor: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/40',
    title: 'The Open-Source Core',
    scenario: 'Created by Linus Torvalds in 1991, this ubiquitous open-source operating system kernel powers 90%+ of the world\'s top 500 supercomputers, billions of Android devices, and major internet cloud infrastructure. What is it called?',
    options: [
      { id: 'a', label: 'Linux', isCorrect: true },
      { id: 'b', label: 'Windows NT Kernel', isCorrect: false },
      { id: 'c', label: 'Darwin BSD', isCorrect: false },
      { id: 'd', label: 'Solaris OS', isCorrect: false },
    ],
    explanation: 'Linux is a free and open-source Unix-like kernel released under GPL licensing.',
    hint: 'Its mascot is a famous cartoon penguin named Tux.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-09',
    category: 'PROGRAMMING',
    categoryLabel: 'Algorithms & Memory',
    categoryColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    title: 'The Infinite Mirror Crash',
    scenario: 'A function calls itself recursively in a loop, but the developer forgot to define a base case condition to terminate recursion. As the call stack fills up all allocated execution frame memory, what classic error causes the process to crash?',
    options: [
      { id: 'a', label: 'Stack Overflow', isCorrect: true },
      { id: 'b', label: 'Null Pointer Dereference', isCorrect: false },
      { id: 'c', label: 'Divide by Zero Exception', isCorrect: false },
      { id: 'd', label: 'Bus Alignment Fault', isCorrect: false },
    ],
    explanation: 'When call frames exceed the reserved execution stack space, the OS raises a Stack Overflow.',
    hint: 'It shares its name with the world\'s most famous Q&A website for software developers.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-10',
    category: 'NETWORKING',
    categoryLabel: 'Internet Protocols',
    categoryColor: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/40',
    title: 'The Web Phonebook',
    scenario: 'Humans find it easy to remember domain names like google.com or github.com, but network routers communicate strictly via numeric IP addresses (like 142.250.190.46). Which global distributed protocol translates human names into IP addresses?',
    options: [
      { id: 'a', label: 'DNS (Domain Name System)', isCorrect: true },
      { id: 'b', label: 'DHCP (Dynamic Host Protocol)', isCorrect: false },
      { id: 'c', label: 'ARP (Address Resolution)', isCorrect: false },
      { id: 'd', label: 'ICMP (Control Message)', isCorrect: false },
    ],
    explanation: 'DNS translates human-readable domain names into numerical IP addresses needed to locate services.',
    hint: 'The acronym stands for Domain Name System.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-11',
    category: 'LOGIC & BINARY',
    categoryLabel: 'Hexadecimal Systems',
    categoryColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    title: 'Base-16 Value Decryption',
    scenario: 'In hexadecimal notation (Base 16), values 0 through 9 are represented by digits, and 10 through 15 are represented by letters A through F. What decimal integer does the hexadecimal digit 0xF represent?',
    options: [
      { id: 'a', label: '15', isCorrect: true },
      { id: 'b', label: '16', isCorrect: false },
      { id: 'c', label: '14', isCorrect: false },
      { id: 'd', label: '10', isCorrect: false },
    ],
    explanation: 'Hexadecimal: A=10, B=11, C=12, D=13, E=14, F=15.',
    hint: 'Count upwards from A=10: A(10), B(11), C(12), D(13), E(14), F(?)',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-12',
    category: 'WEB TECH',
    categoryLabel: 'Web Frontend Core',
    categoryColor: 'text-teal-400 border-teal-500/40 bg-teal-950/40',
    title: 'The Visual Architect',
    scenario: 'In the classic web frontend triad: HTML defines document structure and semantics, while JavaScript handles behavioral interactivity. Which language is responsible for visual styling, colors, typography, and responsive grid layouts?',
    options: [
      { id: 'a', label: 'CSS (Cascading Style Sheets)', isCorrect: true },
      { id: 'b', label: 'SQL (Structured Query)', isCorrect: false },
      { id: 'c', label: 'JSON (JavaScript Object)', isCorrect: false },
      { id: 'd', label: 'YAML (Markup Language)', isCorrect: false },
    ],
    explanation: 'CSS (Cascading Style Sheets) controls how HTML elements are visually styled across devices.',
    hint: 'Its acronym starts with C for "Cascading".',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-13',
    category: 'NETWORKING',
    categoryLabel: 'HTTP Protocol',
    categoryColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    title: 'The Missing Web Resource',
    scenario: 'When a web browser requests an image or page URL that does not exist on the host server, which universally recognized 3-digit HTTP status code is sent back in the HTTP response header?',
    options: [
      { id: 'a', label: '404 (Not Found)', isCorrect: true },
      { id: 'b', label: '200 (OK)', isCorrect: false },
      { id: 'c', label: '500 (Internal Error)', isCorrect: false },
      { id: 'd', label: '301 (Moved Permanently)', isCorrect: false },
    ],
    explanation: 'HTTP 404 Not Found indicates that the origin server did not find a current representation for the target URL.',
    hint: 'Famous error code seen when clicking broken internet links.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-14',
    category: 'PROGRAMMING',
    categoryLabel: 'Programming Syntax',
    categoryColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    title: 'Zero-Indexed Arrays',
    scenario: 'In languages like C, Python, JavaScript, and Java, arrays and lists use 0-based indexing. Given an array arr = [10, 20, 30, 40], which index expression accesses the VERY FIRST element (10)?',
    options: [
      { id: 'a', label: 'arr[0]', isCorrect: true },
      { id: 'b', label: 'arr[1]', isCorrect: false },
      { id: 'c', label: 'arr[first]', isCorrect: false },
      { id: 'd', label: 'arr[-0]', isCorrect: false },
    ],
    explanation: '0-based indexing means indices start at offset 0 from the start of memory.',
    hint: 'The very first slot corresponds to offset zero.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-15',
    category: 'HARDWARE',
    categoryLabel: 'CPU Architecture',
    categoryColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    title: 'The Ultra-Fast Scratchpad',
    scenario: 'Located directly inside the processor silicon die right beside the Arithmetic Logic Unit (ALU), these microscopic storage cells hold operands for immediate instructions and can be read in under one nanosecond. What are they called?',
    options: [
      { id: 'a', label: 'CPU Registers (e.g. EAX, EBX)', isCorrect: true },
      { id: 'b', label: 'Hard Disk Sectors', isCorrect: false },
      { id: 'c', label: 'PCIe Bus Channels', isCorrect: false },
      { id: 'd', label: 'DDR4 Memory Modules', isCorrect: false },
    ],
    explanation: 'CPU registers represent the fastest accessible memory tier in computer architecture.',
    hint: 'Names like RAX, PC (Program Counter), and SP (Stack Pointer) describe these hardware cells.',
    difficulty: 'Novice',
  },
  {
    id: 'tq-16',
    category: 'LOGIC & BINARY',
    categoryLabel: 'Boolean Algebra',
    categoryColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    title: 'Compound Truth Evaluation',
    scenario: 'Let Boolean variable A = true and B = false. Evaluate the Boolean logic expression: (A AND B) OR (NOT B). What is the evaluated output?',
    options: [
      { id: 'a', label: 'true', isCorrect: true },
      { id: 'b', label: 'false', isCorrect: false },
      { id: 'c', label: 'null', isCorrect: false },
      { id: 'd', label: 'undefined', isCorrect: false },
    ],
    explanation: '(A AND B) = (true AND false) = false. (NOT B) = NOT false = true. false OR true = true.',
    hint: 'Evaluate NOT B first: if B is false, what is NOT B? Then combine with OR.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-17',
    category: 'NETWORKING',
    categoryLabel: 'Standard Ports',
    categoryColor: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    title: 'The Default Web Port',
    scenario: 'By international Internet networking standards (IANA), plain unencrypted HTTP web traffic is routed through which standard default TCP port number?',
    options: [
      { id: 'a', label: 'Port 80', isCorrect: true },
      { id: 'b', label: 'Port 21', isCorrect: false },
      { id: 'c', label: 'Port 25', isCorrect: false },
      { id: 'd', label: 'Port 3306', isCorrect: false },
    ],
    explanation: 'Standard web servers listen for unencrypted HTTP traffic on TCP port 80 (and HTTPS on port 443).',
    hint: 'An even round number in the 80s.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-18',
    category: 'OS & CLI',
    categoryLabel: 'Terminal & CLI',
    categoryColor: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/40',
    title: 'Home Directory Shorthand',
    scenario: 'In Linux, Unix, and macOS Bash/Zsh terminals, which single keyboard character symbol acts as a shorthand alias pointing directly to the active user\'s home directory (e.g. cd ~)?',
    options: [
      { id: 'a', label: 'Tilde (~)', isCorrect: true },
      { id: 'b', label: 'At-sign (@)', isCorrect: false },
      { id: 'c', label: 'Percent (%)', isCorrect: false },
      { id: 'd', label: 'Caret (^)', isCorrect: false },
    ],
    explanation: 'The tilde (~) expansion resolves automatically to the environment variable $HOME.',
    hint: 'The wavy accent key located just beneath the Escape key on standard keyboards.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-19',
    category: 'PROGRAMMING',
    categoryLabel: 'Data Structures',
    categoryColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    title: 'The Printer Spooler Order',
    scenario: 'Three students send assignments to the shared lab printer at 9:01, 9:02, and 9:03. The printer prints the first submitted job first. Which data structure model manages this FIFO (First-In, First-Out) order?',
    options: [
      { id: 'a', label: 'Queue', isCorrect: true },
      { id: 'b', label: 'Stack', isCorrect: false },
      { id: 'c', label: 'Binary Heap', isCorrect: false },
      { id: 'd', label: 'Graph Adjacency Matrix', isCorrect: false },
    ],
    explanation: 'A Queue works on FIFO (First-In, First-Out) semantics, just like standing in a ticket line.',
    hint: 'Think of standing in a line or "queue" at a movie theatre ticket counter.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-20',
    category: 'GIT & DEV',
    categoryLabel: 'Git Workflow',
    categoryColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    title: 'Staging Modified Code',
    scenario: 'You edited several source files in your repository. Before creating a permanent commit record, which Git command stages these modified files into the preparation index?',
    options: [
      { id: 'a', label: 'git add .', isCorrect: true },
      { id: 'b', label: 'git pull', isCorrect: false },
      { id: 'c', label: 'git clone', isCorrect: false },
      { id: 'd', label: 'git branch -d', isCorrect: false },
    ],
    explanation: 'git add updates the index using the current content of the working tree to prepare for commit.',
    hint: 'You "add" files to the staging index.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-21',
    category: 'LOGIC & BINARY',
    categoryLabel: 'Color Matrix Hex',
    categoryColor: 'text-teal-400 border-teal-500/40 bg-teal-950/40',
    title: 'The Pure Primary Hex Glow',
    scenario: 'Digital screens display RGB colors using 6 hexadecimal digits in the format #RRGGBB. If the hex code is set to #00FF00 (Red = 00, Green = FF, Blue = 00), what primary color glows on screen?',
    options: [
      { id: 'a', label: 'Bright Green', isCorrect: true },
      { id: 'b', label: 'Bright Red', isCorrect: false },
      { id: 'c', label: 'Pure Blue', isCorrect: false },
      { id: 'd', label: 'Neon Yellow', isCorrect: false },
    ],
    explanation: 'In #RRGGBB, the middle pair (FF = 255) represents maximum intensity for the Green channel.',
    hint: 'R = Red (00), G = Green (FF), B = Blue (00).',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-22',
    category: 'PROGRAMMING',
    categoryLabel: 'Python Essentials',
    categoryColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    title: 'String Length Inspector',
    scenario: 'In Python, which built-in function returns the total number of characters in a string s = "ZeroGravity" or the total item count in a list?',
    options: [
      { id: 'a', label: 'len(s)', isCorrect: true },
      { id: 'b', label: 's.size()', isCorrect: false },
      { id: 'c', label: 'count(s)', isCorrect: false },
      { id: 'd', label: 's.length()', isCorrect: false },
    ],
    explanation: 'Python uses the global built-in function len() to return the length of sequences.',
    hint: 'Short for "length" — 3 letters only.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-23',
    category: 'HARDWARE',
    categoryLabel: 'Computer Architecture',
    categoryColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    title: 'The Computational Brain',
    scenario: 'Often referred to as the "brain" of the computer, which hardware microprocessor component fetches instructions from memory, decodes them, and coordinates arithmetic calculations?',
    options: [
      { id: 'a', label: 'CPU (Central Processing Unit)', isCorrect: true },
      { id: 'b', label: 'PSU (Power Supply Unit)', isCorrect: false },
      { id: 'c', label: 'SATA Controller', isCorrect: false },
      { id: 'd', label: 'Audio DAC', isCorrect: false },
    ],
    explanation: 'The Central Processing Unit (CPU) is the principal chip that executes program instructions.',
    hint: '3-letter acronym starting with C for Central.',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-24',
    category: 'LOGIC & BINARY',
    categoryLabel: 'Binary Arithmetic',
    categoryColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    title: 'The Binary Addition Carry',
    scenario: 'In base-2 binary arithmetic, what is the exact sum of adding 1 + 1 in binary notation?',
    options: [
      { id: 'a', label: '10 (binary 10 = decimal 2)', isCorrect: true },
      { id: 'b', label: '2', isCorrect: false },
      { id: 'c', label: '11', isCorrect: false },
      { id: 'd', label: '01', isCorrect: false },
    ],
    explanation: 'In binary, 1 + 1 equals 2 in decimal, which is written as 10 in binary (0 with a carry of 1).',
    hint: 'Binary only uses digits 0 and 1, so 2 must be written with two digits: "1" and "0".',
    difficulty: 'Beginner',
  },
  {
    id: 'tq-25',
    category: 'PROGRAMMING',
    categoryLabel: 'C Data Types',
    categoryColor: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/40',
    title: 'Floating Precision',
    scenario: 'You need to store a precision fractional sensor measurement like 3.14159 in C language. Which fundamental primitive data type is engineered specifically to hold fractional floating-point numbers?',
    options: [
      { id: 'a', label: 'float or double', isCorrect: true },
      { id: 'b', label: 'int', isCorrect: false },
      { id: 'c', label: 'char', isCorrect: false },
      { id: 'd', label: 'long unsigned void', isCorrect: false },
    ],
    explanation: 'float (32-bit single precision) and double (64-bit double precision) store IEEE-754 decimals.',
    hint: 'It shares its name with something that "floats" on water.',
    difficulty: 'Beginner',
  },
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a randomized, anti-copying 5-question test set.
 * - Randomly selects 5 distinct questions from different technical categories.
 * - Shuffles the 4 options for every question so Option A on Team 1 is Option C or D on Team 2.
 */
export function generateRandomizedQuiz(count: number = 5): TechQuizQuestion[] {
  const shuffledPool = shuffleArray(TECH_QUIZ_POOL);
  const selected = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

  return selected.map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }));
}
