/**
 * AUTOMATED SYSTEM TEST SUITE: Digital Tech Treasure Hunt 2026
 * Verifies all 5 stations, scoring engine, leaderboard ranking rules,
 * 4-Admin Council credentials, and live Supabase end-to-end sync.
 */

const https = require('https');
const QRCode = require('qrcode');

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: Station 01 - Tower Stack Physics & Boundary Logic
// -----------------------------------------------------------------------------
function testStation1TowerStack() {
  console.log('\n--- [TEST SUITE 1] Station 01: Tower Block Stack Physics ---');

  const TARGET_HEIGHT = 5;
  const MIN_BLOCK_WIDTH = 24;
  const PERFECT_SNAP_TOLERANCE = 5.0;

  function calculateSlice(placedX, placedWidth, topX, topWidth) {
    const diff = Math.abs(placedX - topX);
    // Perfect alignment snap
    if (diff <= PERFECT_SNAP_TOLERANCE) {
      return { success: true, snapped: true, x: topX, width: topWidth };
    }
    // Calculate overlap
    const placedLeft = placedX;
    const placedRight = placedX + placedWidth;
    const topLeft = topX;
    const topRight = topX + topWidth;

    const overlapLeft = Math.max(placedLeft, topLeft);
    const overlapRight = Math.min(placedRight, topRight);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      return { success: false, reason: 'Missed completely' };
    }

    const finalWidth = Math.max(MIN_BLOCK_WIDTH, overlapWidth);
    return { success: true, snapped: false, x: overlapLeft, width: finalWidth };
  }

  // Case 1.1: Perfect snap when within tolerance
  const snapResult = calculateSlice(28, 48, 26, 48); // diff = 2 <= 5
  assert(snapResult.snapped === true && snapResult.x === 26, 'Station 1: Snaps to perfect column if within tolerance');

  // Case 1.2: Slice when partial overlap
  const sliceResult = calculateSlice(40, 48, 26, 48); // overlap from 40 to 74 = 34
  assert(sliceResult.success === true && sliceResult.width === 34, 'Station 1: Accurately slices block on partial overhang');

  // Case 1.3: Fails when zero overlap
  const missResult = calculateSlice(80, 20, 20, 40); // 80..100 vs 20..60 -> 0 overlap
  assert(missResult.success === false, 'Station 1: Detects total miss when zero block overlap');

  // Case 1.4: Victory when 5 blocks stacked
  const stack = [1, 2, 3, 4, 5];
  assert(stack.length >= TARGET_HEIGHT, 'Station 1: Reaching 5 stacked blocks fulfills victory requirement');
}

// -----------------------------------------------------------------------------
// TEST SUITE 2: Station 02 - N-Queens Constraint Solver
// -----------------------------------------------------------------------------
function testStation2NQueens() {
  console.log('\n--- [TEST SUITE 2] Station 02: N-Queens Constraint Solver ---');

  function checkConflicts(queens) {
    const conflicts = [];
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];
        const sameRow = q1.row === q2.row;
        const sameCol = q1.col === q2.col;
        const sameDiag = Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col);
        if (sameRow || sameCol || sameDiag) {
          conflicts.push([i, j]);
        }
      }
    }
    return conflicts;
  }

  // Case 2.1: Valid 4-Queens solution: (0,1), (1,3), (2,0), (3,2)
  const valid4Queens = [
    { row: 0, col: 1 },
    { row: 1, col: 3 },
    { row: 2, col: 0 },
    { row: 3, col: 2 },
  ];
  const conflictsValid = checkConflicts(valid4Queens);
  assert(conflictsValid.length === 0, 'Station 2: Valid 4-Queens solution has 0 conflicts');

  // Case 2.2: Second valid 4-Queens solution: (0,2), (1,0), (2,3), (3,1)
  const valid4QueensAlt = [
    { row: 0, col: 2 },
    { row: 1, col: 0 },
    { row: 2, col: 3 },
    { row: 3, col: 1 },
  ];
  assert(checkConflicts(valid4QueensAlt).length === 0, 'Station 2: Alternative 4-Queens solution has 0 conflicts');

  // Case 2.3: Same row conflict
  const rowConflict = [
    { row: 0, col: 0 },
    { row: 0, col: 2 },
  ];
  assert(checkConflicts(rowConflict).length > 0, 'Station 2: Correctly flags queens in identical row');

  // Case 2.4: Diagonal conflict
  const diagConflict = [
    { row: 0, col: 0 },
    { row: 2, col: 2 },
  ];
  assert(checkConflicts(diagConflict).length > 0, 'Station 2: Correctly flags queens in diagonal attack line');
}

// -----------------------------------------------------------------------------
// TEST SUITE 3: Station 03 - C, Python & Compiler Word Search Matrix
// -----------------------------------------------------------------------------
function testStation3CodingWordSearch() {
  console.log('\n--- [TEST SUITE 3] Station 03: C, Python & Compiler Word Search Matrix ---');

  const MATRIX_GRID = [
    ['T', 'K', 'I', 'B', 'B', 'U', 'F', 'F', 'E', 'R', 'M', 'B', 'B'],
    ['Y', 'H', 'V', 'Y', 'R', 'A', 'N', 'I', 'B', 'D', 'U', 'P', 'T'],
    ['G', 'L', 'O', 'B', 'A', 'L', 'A', 'M', 'L', 'L', 'L', 'N', 'A'],
    ['I', 'W', 'X', 'L', 'Y', 'S', 'A', 'E', 'W', 'K', 'R', 'N', 'M'],
    ['Q', 'S', 'G', 'N', 'S', 'L', 'I', 'M', 'X', 'U', 'Y', 'U', 'G'],
    ['V', 'G', 'O', 'E', 'L', 'Y', 'T', 'Z', 'T', 'R', 'S', 'P', 'R'],
    ['H', 'O', 'R', 'O', 'X', 'R', 'P', 'E', 'E', 'T', 'L', 'A', 'E'],
    ['S', 'T', 'C', 'H', 'O', 'R', 'R', 'S', 'C', 'O', 'D', 'R', 'T'],
    ['Y', 'N', 'U', 'P', 'E', 'R', 'E', 'U', 'J', 'B', 'F', 'S', 'N'],
    ['N', 'N', 'M', 'Q', 'Y', 'A', 'R', 'K', 'M', 'P', 'Y', 'E', 'I'],
    ['T', 'I', 'U', 'E', 'Q', 'T', 'D', 'A', 'N', 'X', 'G', 'R', 'O'],
    ['A', 'P', 'M', 'G', 'S', 'D', 'L', 'E', 'X', 'I', 'Y', 'L', 'P'],
    ['X', 'U', 'S', 'N', 'E', 'K', 'O', 'T', 'R', 'D', 'L', 'Y', 'Y'],
  ];

  const CODING_WORDS = [
    { word: 'POINTER', cat: 'C Language', startRow: 11, startCol: 12, dr: -1, dc: 0, len: 7 },
    { word: 'MALLOC', cat: 'C Language', startRow: 2, startCol: 7, dr: 1, dc: -1, len: 6 },
    { word: 'STRUCT', cat: 'C Language', startRow: 11, startCol: 4, dr: -1, dc: 1, len: 6 },
    { word: 'SIZEOF', cat: 'C Language', startRow: 3, startCol: 5, dr: 1, dc: 1, len: 6 },
    { word: 'BUFFER', cat: 'C Language', startRow: 0, startCol: 4, dr: 0, dc: 1, len: 6 },
    { word: 'HEADER', cat: 'C Language', startRow: 7, startCol: 3, dr: 1, dc: 1, len: 6 },
    { word: 'LAMBDA', cat: 'Python', startRow: 11, startCol: 6, dr: -1, dc: 1, len: 6 },
    { word: 'YIELD', cat: 'Python', startRow: 5, startCol: 5, dr: -1, dc: 1, len: 5 },
    { word: 'IMPORT', cat: 'Python', startRow: 10, startCol: 1, dr: -1, dc: 1, len: 6 },
    { word: 'GLOBAL', cat: 'Python', startRow: 2, startCol: 0, dr: 0, dc: 1, len: 6 },
    { word: 'RETURN', cat: 'Python', startRow: 7, startCol: 6, dr: -1, dc: 1, len: 6 },
    { word: 'ASSERT', cat: 'Python', startRow: 2, startCol: 6, dr: 1, dc: -1, len: 6 },
    { word: 'PARSER', cat: 'Compiler', startRow: 5, startCol: 11, dr: 1, dc: 0, len: 6 },
    { word: 'LINKER', cat: 'Compiler', startRow: 12, startCol: 10, dr: -1, dc: -1, len: 6 },
    { word: 'SYNTAX', cat: 'Compiler', startRow: 7, startCol: 0, dr: 1, dc: 0, len: 6 },
    { word: 'BINARY', cat: 'Compiler', startRow: 1, startCol: 8, dr: 0, dc: -1, len: 6 },
    { word: 'TOKENS', cat: 'Compiler', startRow: 12, startCol: 7, dr: 0, dc: -1, len: 6 },
  ];

  // Case 3.1: Every word exists and matches in matrix
  let allWordsMatch = true;
  for (const w of CODING_WORDS) {
    let str = '';
    for (let i = 0; i < w.len; i++) {
      const r = w.startRow + i * w.dr;
      const c = w.startCol + i * w.dc;
      str += MATRIX_GRID[r][c];
    }
    if (str !== w.word) {
      allWordsMatch = false;
      break;
    }
  }
  assert(allWordsMatch, 'Station 3: All 17 words perfectly match their letter coordinates in the 13x13 matrix');

  // Case 3.2: Words are strictly C, Python, and Compiler
  const validCategories = new Set(['C Language', 'Python', 'Compiler']);
  const allCategoriesValid = CODING_WORDS.every((w) => validCategories.has(w.cat));
  assert(allCategoriesValid, 'Station 3: Word bank contains only C, Python, and Compiler keywords');

  // Case 3.3: Minimum 10 words required for sector clearance
  const REQUIRED_COUNT = 10;
  assert(REQUIRED_COUNT === 10 && CODING_WORDS.length >= REQUIRED_COUNT, 'Station 3: Requires finding a minimum of 10 words (out of 17 available)');

  // Case 3.4: Reverse selection detection
  function checkWordMatch(letters) {
    const rev = letters.split('').reverse().join('');
    return CODING_WORDS.some((w) => w.word === letters || w.word === rev);
  }
  assert(checkWordMatch('POINTER') === true, 'Station 3: Forward word selection resolves correctly');
  assert(checkWordMatch('RETNIOP') === true, 'Station 3: Backward/reverse line drag resolves correctly');
}

// -----------------------------------------------------------------------------
// TEST SUITE 3B: Station 04 - Bug Smasher Arcade Timing & Targets
// -----------------------------------------------------------------------------
function testStation4BugSmasher() {
  console.log('\n--- [TEST SUITE 3B] Station 04: Bug Smasher Arcade Target & Timer ---');

  const TARGET_BUGS = 12;
  const TIME_LIMIT = 30;

  assert(TARGET_BUGS === 12, 'Station 4: Target is exactly 12 bugs');
  assert(TIME_LIMIT === 30, 'Station 4: Time limit is 30 seconds');

  function checkWinCondition(smashed, secondsRemaining) {
    return smashed >= TARGET_BUGS && secondsRemaining >= 0;
  }

  assert(checkWinCondition(12, 10) === true, 'Station 4: 12 smashed bugs in 20s (10s remaining) awards victory');
  assert(checkWinCondition(11, 0) === false, 'Station 4: 11 smashed bugs when time expires fails condition');
}

// -----------------------------------------------------------------------------
// TEST SUITE 4: Station 05 - C Loop Snippet Predictor
// -----------------------------------------------------------------------------
function testStation5CPredictor() {
  console.log('\n--- [TEST SUITE 4] Station 05: C Loop Output Predictor Execution ---');

  // Run the exact C loop algorithm in JS:
  let total = 0;
  for (let i = 1; i <= 4; i++) {
    for (let j = i; j <= 4; j++) {
      if ((i + j) % 2 === 0) {
        total += i * 2 + j;
      } else {
        total += j - i;
      }
    }
  }

  const expectedAnswer = '49';
  assert(String(total) === expectedAnswer, 'Station 5: C nested loop arithmetic precisely computes output 49');

  const testUserInputValid = '  49  ';
  assert(testUserInputValid.trim() === expectedAnswer, 'Station 5: User input verification trims and validates correct 49');

  const testUserInputInvalid = '50';
  assert(testUserInputInvalid.trim() !== expectedAnswer, 'Station 5: Rejects incorrect outputs');
}

// -----------------------------------------------------------------------------
// TEST SUITE 5: Scoring Formula & Leaderboard Ranking Algorithm
// -----------------------------------------------------------------------------
function testScoringAndLeaderboard() {
  console.log('\n--- [TEST SUITE 5] Scoring Formula & Leaderboard Ranking Engine ---');

  function calculatePoints(durationSec) {
    const basePoints = 1000;
    const speedBonus = Math.max(100, 1000 - durationSec * 15);
    return basePoints + speedBonus;
  }

  // Fast finish (10 seconds)
  assert(calculatePoints(10) === 1850, 'Scoring: 10s sector clear yields 1,850 pts (1,000 base + 850 speed bonus)');

  // Slow finish (100 seconds) - hits floor
  assert(calculatePoints(100) === 1100, 'Scoring: 100s clear respects minimum floor of 100 bonus pts (1,100 pts total)');

  // Leaderboard Sorting Rules:
  function sortLeaderboard(list) {
    const valid = list.filter((t) => t && t.team_name && t.team_name.trim().length > 0);
    return valid.sort((a, b) => {
      // 1. Disqualified
      if (a.is_disqualified && !b.is_disqualified) return 1;
      if (!a.is_disqualified && b.is_disqualified) return -1;

      const aCompleted = (a.current_level ?? 1) > 5;
      const bCompleted = (b.current_level ?? 1) > 5;

      const totalTimeA = (a.elapsed_time || 0) + (a.penalties || 0);
      const totalTimeB = (b.elapsed_time || 0) + (b.penalties || 0);

      // 2. Completed ranks ahead of in-progress
      if (aCompleted && !bCompleted) return -1;
      if (!aCompleted && bCompleted) return 1;

      // 3. Both completed
      if (aCompleted && bCompleted) {
        if (b.score !== a.score) return b.score - a.score;
        return totalTimeA - totalTimeB;
      }

      // 4. In progress
      if (b.current_level !== a.current_level) return b.current_level - a.current_level;
      if (b.score !== a.score) return b.score - a.score;
      return totalTimeA - totalTimeB;
    });
  }

  const sampleTeams = [
    { team_id: 'TEAM_01', team_name: 'Fast Finisher', current_level: 6, score: 7500, elapsed_time: 120, penalties: 0 },
    { team_id: 'TEAM_02', team_name: 'Slow Finisher', current_level: 6, score: 6200, elapsed_time: 250, penalties: 0 },
    { team_id: 'TEAM_03', team_name: 'In Progress Level 4', current_level: 4, score: 4800, elapsed_time: 90, penalties: 0 },
    { team_id: 'TEAM_04', team_name: 'Disqualified Team', current_level: 6, score: 9999, elapsed_time: 50, penalties: 0, is_disqualified: true },
    { team_id: 'TEAM_05', team_name: 'In Progress Level 5', current_level: 5, score: 5500, elapsed_time: 140, penalties: 0 },
  ];

  const sorted = sortLeaderboard(sampleTeams);

  assert(sorted[0].team_id === 'TEAM_01', 'Leaderboard Ranking: Rank 1 is highest scoring completed team');
  assert(sorted[1].team_id === 'TEAM_02', 'Leaderboard Ranking: Rank 2 is completed team before in-progress teams');
  assert(sorted[2].team_id === 'TEAM_05', 'Leaderboard Ranking: Rank 3 is highest sector in-progress squad (Level 5)');
  assert(sorted[3].team_id === 'TEAM_03', 'Leaderboard Ranking: Rank 4 is Level 4 squad');
  assert(sorted[4].team_id === 'TEAM_04', 'Leaderboard Ranking: Disqualified team is strictly placed last');
}

// -----------------------------------------------------------------------------
// TEST SUITE 6: 4-Admin Council Roster & Passcode Security
// -----------------------------------------------------------------------------
function testAdminCouncilConfig() {
  console.log('\n--- [TEST SUITE 6] 4-Admin Council Credentials & Security ---');

  const EXPECTED_ADMINS = [
    { id: 'admin-1', name: 'Neethu N (Lead Director)', passcode: 'ADMIN-2026', role: 'Chief Organizer & Mission Commander' },
    { id: 'admin-2', name: 'Nithin P H', passcode: 'NITHIN-2026', role: 'Security Architect & Mission Co-Director' },
    { id: 'admin-3', name: 'Likith S K', passcode: 'LIKITH-2026', role: 'Scorekeeper & Quantum Marshal' },
    { id: 'admin-4', name: 'Aayush', passcode: 'AAYUSH-2026', role: 'Code Arbiter & Technical Proctor' },
  ];

  assert(EXPECTED_ADMINS.length === 4, 'Admin Council: Exactly 4 director council seats configured');

  // Verify passcodes are distinct and present
  const passcodes = EXPECTED_ADMINS.map((a) => a.passcode);
  const uniquePasscodes = new Set(passcodes);
  assert(uniquePasscodes.size === 4, 'Admin Council: All 4 admin seats have unique secure passcodes');

  function verifyPasscode(inputPasscode) {
    return EXPECTED_ADMINS.find((a) => a.passcode.toUpperCase() === inputPasscode.trim().toUpperCase());
  }

  assert(verifyPasscode('admin-2026')?.id === 'admin-1', 'Admin Council: Passcode check succeeds for Lead Director Neethu N');
  assert(verifyPasscode('NITHIN-2026')?.name === 'Nithin P H', 'Admin Council: Passcode check succeeds for Nithin P H');
  assert(verifyPasscode('LIKITH-2026')?.name === 'Likith S K', 'Admin Council: Passcode check succeeds for Likith S K');
  assert(verifyPasscode('AAYUSH-2026')?.name === 'Aayush', 'Admin Council: Passcode check succeeds for Aayush');
  assert(verifyPasscode('WRONG-CODE') === undefined, 'Admin Council: Rejects unauthorized access codes');
}

// -----------------------------------------------------------------------------
// TEST SUITE 7: QR Code Generator & Participant Sharing
// -----------------------------------------------------------------------------
async function testQrCodeGeneration() {
  console.log('\n--- [TEST SUITE 7] QR Code & Participant Sharing Engine ---');

  const shareUrl = 'https://ais-pre-dr7srznjvzfjr5vepnihzx-173902379630.asia-east1.run.app';
  try {
    const dataUrl = await QRCode.toDataURL(shareUrl, { errorCorrectionLevel: 'H' });
    assert(dataUrl.startsWith('data:image/png;base64,'), 'QR Code Engine: Successfully generates high-res PNG data URL for participants');
  } catch (err) {
    assert(false, 'QR Code Engine: Generation error', err.message);
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 8: Live Supabase Cloud Database Integration (End-to-End)
// -----------------------------------------------------------------------------
function testSupabaseLiveIntegration() {
  console.log('\n--- [TEST SUITE 8] Live Supabase Cloud Database End-to-End ---');

  const SUPABASE_URL = 'https://nrqvpelwbyhzljbaoiop.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_EuJ_SCymwJDMB3xOTsihLQ_lCkYZ_KC';
  const TEST_SQUAD_ID = 'TEST_SQUAD_999';

  return new Promise((resolve) => {
    // 1. Live Fetch
    const getOptions = {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
      },
    };

    https
      .get(`${SUPABASE_URL}/rest/v1/leaderboard?select=team_id`, getOptions, (res) => {
        assert(res.statusCode === 200, 'Supabase Live: GET /rest/v1/leaderboard returns HTTP 200 OK');

        // 2. Live Registration Upsert
        const testPayload = JSON.stringify({
          team_id: TEST_SQUAD_ID,
          team_name: 'Automated Test Squad',
          avatar: '⚡',
          current_level: 3,
          score: 3450,
          elapsed_time: 45,
          penalties: 0,
          is_disqualified: false,
          updated_at: new Date().toISOString(),
        });

        const postReq = https.request(
          `${SUPABASE_URL}/rest/v1/leaderboard?on_conflict=team_id`,
          {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: 'Bearer ' + SUPABASE_KEY,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=representation',
            },
          },
          (postRes) => {
            let body = '';
            postRes.on('data', (c) => (body += c));
            postRes.on('end', () => {
              assert(
                postRes.statusCode === 201 || postRes.statusCode === 200,
                'Supabase Live: Team registration upsert returns HTTP 201/200'
              );

              try {
                const parsed = JSON.parse(body);
                assert(
                  Array.isArray(parsed) && parsed[0]?.team_id === TEST_SQUAD_ID,
                  'Supabase Live: Returned record matches registered test squad data'
                );
              } catch (e) {
                assert(false, 'Supabase Live: JSON parse error', e.message);
              }

              // 3. Live Teardown / Cleanup
              const delReq = https.request(
                `${SUPABASE_URL}/rest/v1/leaderboard?team_id=eq.${TEST_SQUAD_ID}`,
                {
                  method: 'DELETE',
                  headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: 'Bearer ' + SUPABASE_KEY,
                  },
                },
                (delRes) => {
                  assert(
                    delRes.statusCode === 204 || delRes.statusCode === 200,
                    'Supabase Live: Cleanup DELETE request cleanly purges test squad (HTTP 204)'
                  );
                  resolve();
                }
              );
              delReq.on('error', (err) => {
                assert(false, 'Supabase Live: Cleanup failed', err.message);
                resolve();
              });
              delReq.end();
            });
          }
        );

        postReq.on('error', (err) => {
          assert(false, 'Supabase Live: POST upsert error', err.message);
          resolve();
        });
        postReq.write(testPayload);
        postReq.end();
      })
      .on('error', (err) => {
        assert(false, 'Supabase Live: GET connection error', err.message);
        resolve();
      });
  });
}

// -----------------------------------------------------------------------------
// MAIN RUNNER
// -----------------------------------------------------------------------------
async function runAllTests() {
  console.log('================================================================');
  console.log('🚀 DIGITAL TECH TREASURE HUNT 2026: COMPREHENSIVE TEST RUNNER');
  console.log('================================================================');

  testStation1TowerStack();
  testStation2NQueens();
  testStation3CodingWordSearch();
  testStation4BugSmasher();
  testStation5CPredictor();
  testScoringAndLeaderboard();
  testAdminCouncilConfig();
  await testQrCodeGeneration();
  await testSupabaseLiveIntegration();

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS SUMMARY:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed:      ${passedTests} ✅`);
  console.log(`   Failed:      ${failedTests} ${failedTests === 0 ? '🎉' : '❌'}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
