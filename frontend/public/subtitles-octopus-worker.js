null;
var Module = typeof Module != 'undefined' ? Module : {};
var hasNativeConsole = typeof console !== 'undefined';
function makeCustomConsole() {
  var console = (function () {
    function postConsoleMessage(prefix, args) {
      postMessage({ target: 'console-' + prefix, content: JSON.stringify(Array.prototype.slice.call(args)) });
    }
    return {
      log: function () {
        postConsoleMessage('log', arguments);
      },
      debug: function () {
        postConsoleMessage('debug', arguments);
      },
      info: function () {
        postConsoleMessage('info', arguments);
      },
      warn: function () {
        postConsoleMessage('warn', arguments);
      },
      error: function () {
        postConsoleMessage('error', arguments);
      },
    };
  })();
  return console;
}
function isBrotliFile(url) {
  var len = url.indexOf('?');
  if (len === -1) {
    len = url.length;
  }
  if (url.endsWith('.br', len)) {
    console.warn(
      'Support for manual brotli decompression is tentatively deprecated and ' +
        "may be removed with the next release. Instead use HTTP's Content-Encoding."
    );
    return true;
  }
  return false;
}
Module = Module || {};
Module['preRun'] = Module['preRun'] || [];
Module['preRun'].push(function () {
  Module['FS_createPath']('/', 'fonts', true, true);
  Module['FS_createPath']('/', 'fontconfig', true, true);
  if (!self.subContent) {
    if (isBrotliFile(self.subUrl)) {
      self.subContent = Module['BrotliDecode'](readBinary(self.subUrl));
    } else {
      self.subContent = read_(self.subUrl);
    }
  }
  if (self.availableFonts && self.availableFonts.length !== 0) {
    var sections = parseAss(self.subContent);
    for (var i = 0; i < sections.length; i++) {
      for (var j = 0; j < sections[i].body.length; j++) {
        if (sections[i].body[j].key === 'Style') {
          self.writeFontToFS(sections[i].body[j].value['Fontname']);
        }
      }
    }
    var regex = /\\fn([^\\}]*?)[\\}]/g;
    var matches;
    while ((matches = regex.exec(self.subContent))) {
      self.writeFontToFS(matches[1]);
    }
  }
  if (self.subContent) {
    Module['FS'].writeFile('/sub.ass', self.subContent);
  }
  self.subContent = null;
  self.loadFontFile('.fallback-', self.fallbackFont);
  var fontFiles = self.fontFiles || [];
  for (var i = 0; i < fontFiles.length; i++) {
    self.loadFontFile('font' + i + '-', fontFiles[i]);
  }
});
Module['onRuntimeInitialized'] = function () {
  self.octObj = new Module.SubtitleOctopus();
  self.changed = Module._malloc(4);
  self.blendTime = Module._malloc(8);
  self.blendX = Module._malloc(4);
  self.blendY = Module._malloc(4);
  self.blendW = Module._malloc(4);
  self.blendH = Module._malloc(4);
  self.octObj.initLibrary(screen.width, screen.height, '/fonts/.fallback-' + self.fallbackFont.split('/').pop());
  self.octObj.setDropAnimations(self.dropAllAnimations);
  self.octObj.createTrack('/sub.ass');
  self.ass_track = self.octObj.track;
  self.ass_library = self.octObj.ass_library;
  self.ass_renderer = self.octObj.ass_renderer;
  if (self.libassMemoryLimit > 0 || self.libassGlyphLimit > 0) {
    self.octObj.setMemoryLimits(self.libassGlyphLimit, self.libassMemoryLimit);
  }
};
Module['print'] = function (text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
  console.log(text);
};
Module['printErr'] = function (text) {
  if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
  console.error(text);
};
if (!hasNativeConsole) {
  var console = {
    log: function (x) {
      if (typeof dump === 'function') dump('log: ' + x + '\n');
    },
    debug: function (x) {
      if (typeof dump === 'function') dump('debug: ' + x + '\n');
    },
    info: function (x) {
      if (typeof dump === 'function') dump('info: ' + x + '\n');
    },
    warn: function (x) {
      if (typeof dump === 'function') dump('warn: ' + x + '\n');
    },
    error: function (x) {
      if (typeof dump === 'function') dump('error: ' + x + '\n');
    },
  };
}
function BrotliDecodeClosure() {
  null;
  var DICTIONARY_DATA = new Int8Array(0);
  function InputStream(bytes) {
    this.data = bytes;
    this.offset = 0;
  }
  var MAX_HUFFMAN_TABLE_SIZE = Int32Array.from([
    256, 402, 436, 468, 500, 534, 566, 598, 630, 662, 694, 726, 758, 790, 822, 854, 886, 920, 952, 984, 1016, 1048,
    1080,
  ]);
  var CODE_LENGTH_CODE_ORDER = Int32Array.from([1, 2, 3, 4, 0, 5, 17, 6, 16, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  var DISTANCE_SHORT_CODE_INDEX_OFFSET = Int32Array.from([0, 3, 2, 1, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3]);
  var DISTANCE_SHORT_CODE_VALUE_OFFSET = Int32Array.from([0, 0, 0, 0, -1, 1, -2, 2, -3, 3, -1, 1, -2, 2, -3, 3]);
  var FIXED_TABLE = Int32Array.from([
    131072, 131076, 131075, 196610, 131072, 131076, 131075, 262145, 131072, 131076, 131075, 196610, 131072, 131076,
    131075, 262149,
  ]);
  var DICTIONARY_OFFSETS_BY_LENGTH = Int32Array.from([
    0, 0, 0, 0, 0, 4096, 9216, 21504, 35840, 44032, 53248, 63488, 74752, 87040, 93696, 100864, 104704, 106752, 108928,
    113536, 115968, 118528, 119872, 121280, 122016,
  ]);
  var DICTIONARY_SIZE_BITS_BY_LENGTH = Int32Array.from([
    0, 0, 0, 0, 10, 10, 11, 11, 10, 10, 10, 10, 10, 9, 9, 8, 7, 7, 8, 7, 7, 6, 6, 5, 5,
  ]);
  var BLOCK_LENGTH_OFFSET = Int32Array.from([
    1, 5, 9, 13, 17, 25, 33, 41, 49, 65, 81, 97, 113, 145, 177, 209, 241, 305, 369, 497, 753, 1265, 2289, 4337, 8433,
    16625,
  ]);
  var BLOCK_LENGTH_N_BITS = Int32Array.from([
    2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 24,
  ]);
  var INSERT_LENGTH_N_BITS = Int16Array.from([
    0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 12, 14, 24,
  ]);
  var COPY_LENGTH_N_BITS = Int16Array.from([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 24]);
  var CMD_LOOKUP = new Int16Array(2816);
  {
    unpackCommandLookupTable(CMD_LOOKUP);
  }
  function log2floor(i) {
    var result = -1;
    var step = 16;
    while (step > 0) {
      if (i >>> step != 0) {
        result += step;
        i = i >>> step;
      }
      step = step >> 1;
    }
    return result + i;
  }
  function calculateDistanceAlphabetSize(npostfix, ndirect, maxndistbits) {
    return 16 + ndirect + 2 * (maxndistbits << npostfix);
  }
  function calculateDistanceAlphabetLimit(maxDistance, npostfix, ndirect) {
    if (maxDistance < ndirect + (2 << npostfix)) {
      throw 'maxDistance is too small';
    }
    var offset = ((maxDistance - ndirect) >> npostfix) + 4;
    var ndistbits = log2floor(offset) - 1;
    var group = ((ndistbits - 1) << 1) | ((offset >> ndistbits) & 1);
    return ((group - 1) << npostfix) + (1 << npostfix) + ndirect + 16;
  }
  function unpackCommandLookupTable(cmdLookup) {
    var insertLengthOffsets = new Int16Array(24);
    var copyLengthOffsets = new Int16Array(24);
    copyLengthOffsets[0] = 2;
    for (var i = 0; i < 23; ++i) {
      insertLengthOffsets[i + 1] = insertLengthOffsets[i] + (1 << INSERT_LENGTH_N_BITS[i]);
      copyLengthOffsets[i + 1] = copyLengthOffsets[i] + (1 << COPY_LENGTH_N_BITS[i]);
    }
    for (var cmdCode = 0; cmdCode < 704; ++cmdCode) {
      var rangeIdx = cmdCode >>> 6;
      var distanceContextOffset = -4;
      if (rangeIdx >= 2) {
        rangeIdx -= 2;
        distanceContextOffset = 0;
      }
      var insertCode = (((170064 >>> (rangeIdx * 2)) & 3) << 3) | ((cmdCode >>> 3) & 7);
      var copyCode = (((156228 >>> (rangeIdx * 2)) & 3) << 3) | (cmdCode & 7);
      var copyLengthOffset = copyLengthOffsets[copyCode];
      var distanceContext = distanceContextOffset + (copyLengthOffset > 4 ? 3 : copyLengthOffset - 2);
      var index = cmdCode * 4;
      cmdLookup[index + 0] = INSERT_LENGTH_N_BITS[insertCode] | (COPY_LENGTH_N_BITS[copyCode] << 8);
      cmdLookup[index + 1] = insertLengthOffsets[insertCode];
      cmdLookup[index + 2] = copyLengthOffsets[copyCode];
      cmdLookup[index + 3] = distanceContext;
    }
  }
  function decodeWindowBits(s) {
    var largeWindowEnabled = s.isLargeWindow;
    s.isLargeWindow = 0;
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    if (readFewBits(s, 1) == 0) {
      return 16;
    }
    var n = readFewBits(s, 3);
    if (n != 0) {
      return 17 + n;
    }
    n = readFewBits(s, 3);
    if (n != 0) {
      if (n == 1) {
        if (largeWindowEnabled == 0) {
          return -1;
        }
        s.isLargeWindow = 1;
        if (readFewBits(s, 1) == 1) {
          return -1;
        }
        n = readFewBits(s, 6);
        if (n < 10 || n > 30) {
          return -1;
        }
        return n;
      } else {
        return 8 + n;
      }
    }
    return 17;
  }
  function initState(s, input) {
    if (s.runningState != 0) {
      throw 'State MUST be uninitialized';
    }
    s.blockTrees = new Int32Array(3091);
    s.blockTrees[0] = 7;
    s.distRbIdx = 3;
    var maxDistanceAlphabetLimit = calculateDistanceAlphabetLimit(2147483644, 3, 15 << 3);
    s.distExtraBits = new Int8Array(maxDistanceAlphabetLimit);
    s.distOffset = new Int32Array(maxDistanceAlphabetLimit);
    s.input = input;
    initBitReader(s);
    s.runningState = 1;
  }
  function close(s) {
    if (s.runningState == 0) {
      throw 'State MUST be initialized';
    }
    if (s.runningState == 11) {
      return;
    }
    s.runningState = 11;
    if (s.input != null) {
      closeInput(s.input);
      s.input = null;
    }
  }
  function decodeVarLenUnsignedByte(s) {
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    if (readFewBits(s, 1) != 0) {
      var n = readFewBits(s, 3);
      if (n == 0) {
        return 1;
      } else {
        return readFewBits(s, n) + (1 << n);
      }
    }
    return 0;
  }
  function decodeMetaBlockLength(s) {
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    s.inputEnd = readFewBits(s, 1);
    s.metaBlockLength = 0;
    s.isUncompressed = 0;
    s.isMetadata = 0;
    if (s.inputEnd != 0 && readFewBits(s, 1) != 0) {
      return;
    }
    var sizeNibbles = readFewBits(s, 2) + 4;
    if (sizeNibbles == 7) {
      s.isMetadata = 1;
      if (readFewBits(s, 1) != 0) {
        throw 'Corrupted reserved bit';
      }
      var sizeBytes = readFewBits(s, 2);
      if (sizeBytes == 0) {
        return;
      }
      for (var i = 0; i < sizeBytes; i++) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        var bits = readFewBits(s, 8);
        if (bits == 0 && i + 1 == sizeBytes && sizeBytes > 1) {
          throw 'Exuberant nibble';
        }
        s.metaBlockLength |= bits << (i * 8);
      }
    } else {
      for (var i = 0; i < sizeNibbles; i++) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        var bits = readFewBits(s, 4);
        if (bits == 0 && i + 1 == sizeNibbles && sizeNibbles > 4) {
          throw 'Exuberant nibble';
        }
        s.metaBlockLength |= bits << (i * 4);
      }
    }
    s.metaBlockLength++;
    if (s.inputEnd == 0) {
      s.isUncompressed = readFewBits(s, 1);
    }
  }
  function readSymbol(tableGroup, tableIdx, s) {
    var offset = tableGroup[tableIdx];
    var val = s.accumulator32 >>> s.bitOffset;
    offset += val & 255;
    var bits = tableGroup[offset] >> 16;
    var sym = tableGroup[offset] & 65535;
    if (bits <= 8) {
      s.bitOffset += bits;
      return sym;
    }
    offset += sym;
    var mask = (1 << bits) - 1;
    offset += (val & mask) >>> 8;
    s.bitOffset += (tableGroup[offset] >> 16) + 8;
    return tableGroup[offset] & 65535;
  }
  function readBlockLength(tableGroup, tableIdx, s) {
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var code = readSymbol(tableGroup, tableIdx, s);
    var n = BLOCK_LENGTH_N_BITS[code];
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    return BLOCK_LENGTH_OFFSET[code] + (n <= 16 ? readFewBits(s, n) : readManyBits(s, n));
  }
  function moveToFront(v, index) {
    var value = v[index];
    for (; index > 0; index--) {
      v[index] = v[index - 1];
    }
    v[0] = value;
  }
  function inverseMoveToFrontTransform(v, vLen) {
    var mtf = new Int32Array(256);
    for (var i = 0; i < 256; i++) {
      mtf[i] = i;
    }
    for (var i = 0; i < vLen; i++) {
      var index = v[i] & 255;
      v[i] = mtf[index];
      if (index != 0) {
        moveToFront(mtf, index);
      }
    }
  }
  function readHuffmanCodeLengths(codeLengthCodeLengths, numSymbols, codeLengths, s) {
    var symbol = 0;
    var prevCodeLen = 8;
    var repeat = 0;
    var repeatCodeLen = 0;
    var space = 32768;
    var table = new Int32Array(32 + 1);
    var tableIdx = table.length - 1;
    buildHuffmanTable(table, tableIdx, 5, codeLengthCodeLengths, 18);
    while (symbol < numSymbols && space > 0) {
      if (s.halfOffset > 2030) {
        doReadMoreInput(s);
      }
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var p = (s.accumulator32 >>> s.bitOffset) & 31;
      s.bitOffset += table[p] >> 16;
      var codeLen = table[p] & 65535;
      if (codeLen < 16) {
        repeat = 0;
        codeLengths[symbol++] = codeLen;
        if (codeLen != 0) {
          prevCodeLen = codeLen;
          space -= 32768 >> codeLen;
        }
      } else {
        var extraBits = codeLen - 14;
        var newLen = 0;
        if (codeLen == 16) {
          newLen = prevCodeLen;
        }
        if (repeatCodeLen != newLen) {
          repeat = 0;
          repeatCodeLen = newLen;
        }
        var oldRepeat = repeat;
        if (repeat > 0) {
          repeat -= 2;
          repeat <<= extraBits;
        }
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        repeat += readFewBits(s, extraBits) + 3;
        var repeatDelta = repeat - oldRepeat;
        if (symbol + repeatDelta > numSymbols) {
          throw 'symbol + repeatDelta > numSymbols';
        }
        for (var i = 0; i < repeatDelta; i++) {
          codeLengths[symbol++] = repeatCodeLen;
        }
        if (repeatCodeLen != 0) {
          space -= repeatDelta << (15 - repeatCodeLen);
        }
      }
    }
    if (space != 0) {
      throw 'Unused space';
    }
    codeLengths.fill(0, symbol, numSymbols);
  }
  function checkDupes(symbols, length) {
    for (var i = 0; i < length - 1; ++i) {
      for (var j = i + 1; j < length; ++j) {
        if (symbols[i] == symbols[j]) {
          throw 'Duplicate simple Huffman code symbol';
        }
      }
    }
  }
  function readSimpleHuffmanCode(alphabetSizeMax, alphabetSizeLimit, tableGroup, tableIdx, s) {
    var codeLengths = new Int32Array(alphabetSizeLimit);
    var symbols = new Int32Array(4);
    var maxBits = 1 + log2floor(alphabetSizeMax - 1);
    var numSymbols = readFewBits(s, 2) + 1;
    for (var i = 0; i < numSymbols; i++) {
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var symbol = readFewBits(s, maxBits);
      if (symbol >= alphabetSizeLimit) {
        throw "Can't readHuffmanCode";
      }
      symbols[i] = symbol;
    }
    checkDupes(symbols, numSymbols);
    var histogramId = numSymbols;
    if (numSymbols == 4) {
      histogramId += readFewBits(s, 1);
    }
    switch (histogramId) {
      case 1:
        codeLengths[symbols[0]] = 1;
        break;
      case 2:
        codeLengths[symbols[0]] = 1;
        codeLengths[symbols[1]] = 1;
        break;
      case 3:
        codeLengths[symbols[0]] = 1;
        codeLengths[symbols[1]] = 2;
        codeLengths[symbols[2]] = 2;
        break;
      case 4:
        codeLengths[symbols[0]] = 2;
        codeLengths[symbols[1]] = 2;
        codeLengths[symbols[2]] = 2;
        codeLengths[symbols[3]] = 2;
        break;
      case 5:
        codeLengths[symbols[0]] = 1;
        codeLengths[symbols[1]] = 2;
        codeLengths[symbols[2]] = 3;
        codeLengths[symbols[3]] = 3;
        break;
      default:
        break;
    }
    return buildHuffmanTable(tableGroup, tableIdx, 8, codeLengths, alphabetSizeLimit);
  }
  function readComplexHuffmanCode(alphabetSizeLimit, skip, tableGroup, tableIdx, s) {
    var codeLengths = new Int32Array(alphabetSizeLimit);
    var codeLengthCodeLengths = new Int32Array(18);
    var space = 32;
    var numCodes = 0;
    for (var i = skip; i < 18 && space > 0; i++) {
      var codeLenIdx = CODE_LENGTH_CODE_ORDER[i];
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var p = (s.accumulator32 >>> s.bitOffset) & 15;
      s.bitOffset += FIXED_TABLE[p] >> 16;
      var v = FIXED_TABLE[p] & 65535;
      codeLengthCodeLengths[codeLenIdx] = v;
      if (v != 0) {
        space -= 32 >> v;
        numCodes++;
      }
    }
    if (space != 0 && numCodes != 1) {
      throw 'Corrupted Huffman code histogram';
    }
    readHuffmanCodeLengths(codeLengthCodeLengths, alphabetSizeLimit, codeLengths, s);
    return buildHuffmanTable(tableGroup, tableIdx, 8, codeLengths, alphabetSizeLimit);
  }
  function readHuffmanCode(alphabetSizeMax, alphabetSizeLimit, tableGroup, tableIdx, s) {
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var simpleCodeOrSkip = readFewBits(s, 2);
    if (simpleCodeOrSkip == 1) {
      return readSimpleHuffmanCode(alphabetSizeMax, alphabetSizeLimit, tableGroup, tableIdx, s);
    } else {
      return readComplexHuffmanCode(alphabetSizeLimit, simpleCodeOrSkip, tableGroup, tableIdx, s);
    }
  }
  function decodeContextMap(contextMapSize, contextMap, s) {
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    var numTrees = decodeVarLenUnsignedByte(s) + 1;
    if (numTrees == 1) {
      contextMap.fill(0, 0, contextMapSize);
      return numTrees;
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var useRleForZeros = readFewBits(s, 1);
    var maxRunLengthPrefix = 0;
    if (useRleForZeros != 0) {
      maxRunLengthPrefix = readFewBits(s, 4) + 1;
    }
    var alphabetSize = numTrees + maxRunLengthPrefix;
    var tableSize = MAX_HUFFMAN_TABLE_SIZE[(alphabetSize + 31) >> 5];
    var table = new Int32Array(tableSize + 1);
    var tableIdx = table.length - 1;
    readHuffmanCode(alphabetSize, alphabetSize, table, tableIdx, s);
    for (var i = 0; i < contextMapSize; ) {
      if (s.halfOffset > 2030) {
        doReadMoreInput(s);
      }
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      var code = readSymbol(table, tableIdx, s);
      if (code == 0) {
        contextMap[i] = 0;
        i++;
      } else if (code <= maxRunLengthPrefix) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        var reps = (1 << code) + readFewBits(s, code);
        while (reps != 0) {
          if (i >= contextMapSize) {
            throw 'Corrupted context map';
          }
          contextMap[i] = 0;
          i++;
          reps--;
        }
      } else {
        contextMap[i] = code - maxRunLengthPrefix;
        i++;
      }
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    if (readFewBits(s, 1) == 1) {
      inverseMoveToFrontTransform(contextMap, contextMapSize);
    }
    return numTrees;
  }
  function decodeBlockTypeAndLength(s, treeType, numBlockTypes) {
    var ringBuffers = s.rings;
    var offset = 4 + treeType * 2;
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    var blockType = readSymbol(s.blockTrees, 2 * treeType, s);
    var result = readBlockLength(s.blockTrees, 2 * treeType + 1, s);
    if (blockType == 1) {
      blockType = ringBuffers[offset + 1] + 1;
    } else if (blockType == 0) {
      blockType = ringBuffers[offset];
    } else {
      blockType -= 2;
    }
    if (blockType >= numBlockTypes) {
      blockType -= numBlockTypes;
    }
    ringBuffers[offset] = ringBuffers[offset + 1];
    ringBuffers[offset + 1] = blockType;
    return result;
  }
  function decodeLiteralBlockSwitch(s) {
    s.literalBlockLength = decodeBlockTypeAndLength(s, 0, s.numLiteralBlockTypes);
    var literalBlockType = s.rings[5];
    s.contextMapSlice = literalBlockType << 6;
    s.literalTreeIdx = s.contextMap[s.contextMapSlice] & 255;
    var contextMode = s.contextModes[literalBlockType];
    s.contextLookupOffset1 = contextMode << 9;
    s.contextLookupOffset2 = s.contextLookupOffset1 + 256;
  }
  function decodeCommandBlockSwitch(s) {
    s.commandBlockLength = decodeBlockTypeAndLength(s, 1, s.numCommandBlockTypes);
    s.commandTreeIdx = s.rings[7];
  }
  function decodeDistanceBlockSwitch(s) {
    s.distanceBlockLength = decodeBlockTypeAndLength(s, 2, s.numDistanceBlockTypes);
    s.distContextMapSlice = s.rings[9] << 2;
  }
  function maybeReallocateRingBuffer(s) {
    var newSize = s.maxRingBufferSize;
    if (newSize > s.expectedTotalSize) {
      var minimalNewSize = s.expectedTotalSize;
      while (newSize >> 1 > minimalNewSize) {
        newSize >>= 1;
      }
      if (s.inputEnd == 0 && newSize < 16384 && s.maxRingBufferSize >= 16384) {
        newSize = 16384;
      }
    }
    if (newSize <= s.ringBufferSize) {
      return;
    }
    var ringBufferSizeWithSlack = newSize + 37;
    var newBuffer = new Int8Array(ringBufferSizeWithSlack);
    if (s.ringBuffer.length != 0) {
      newBuffer.set(s.ringBuffer.subarray(0, 0 + s.ringBufferSize), 0);
    }
    s.ringBuffer = newBuffer;
    s.ringBufferSize = newSize;
  }
  function readNextMetablockHeader(s) {
    if (s.inputEnd != 0) {
      s.nextRunningState = 10;
      s.runningState = 12;
      return;
    }
    s.literalTreeGroup = new Int32Array(0);
    s.commandTreeGroup = new Int32Array(0);
    s.distanceTreeGroup = new Int32Array(0);
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    decodeMetaBlockLength(s);
    if (s.metaBlockLength == 0 && s.isMetadata == 0) {
      return;
    }
    if (s.isUncompressed != 0 || s.isMetadata != 0) {
      jumpToByteBoundary(s);
      s.runningState = s.isMetadata != 0 ? 5 : 6;
    } else {
      s.runningState = 3;
    }
    if (s.isMetadata != 0) {
      return;
    }
    s.expectedTotalSize += s.metaBlockLength;
    if (s.expectedTotalSize > 1 << 30) {
      s.expectedTotalSize = 1 << 30;
    }
    if (s.ringBufferSize < s.maxRingBufferSize) {
      maybeReallocateRingBuffer(s);
    }
  }
  function readMetablockPartition(s, treeType, numBlockTypes) {
    var offset = s.blockTrees[2 * treeType];
    if (numBlockTypes <= 1) {
      s.blockTrees[2 * treeType + 1] = offset;
      s.blockTrees[2 * treeType + 2] = offset;
      return 1 << 28;
    }
    var blockTypeAlphabetSize = numBlockTypes + 2;
    offset += readHuffmanCode(blockTypeAlphabetSize, blockTypeAlphabetSize, s.blockTrees, 2 * treeType, s);
    s.blockTrees[2 * treeType + 1] = offset;
    var blockLengthAlphabetSize = 26;
    offset += readHuffmanCode(blockLengthAlphabetSize, blockLengthAlphabetSize, s.blockTrees, 2 * treeType + 1, s);
    s.blockTrees[2 * treeType + 2] = offset;
    return readBlockLength(s.blockTrees, 2 * treeType + 1, s);
  }
  function calculateDistanceLut(s, alphabetSizeLimit) {
    var distExtraBits = s.distExtraBits;
    var distOffset = s.distOffset;
    var npostfix = s.distancePostfixBits;
    var ndirect = s.numDirectDistanceCodes;
    var postfix = 1 << npostfix;
    var bits = 1;
    var half = 0;
    var i = 16;
    for (var j = 0; j < ndirect; ++j) {
      distExtraBits[i] = 0;
      distOffset[i] = j + 1;
      ++i;
    }
    while (i < alphabetSizeLimit) {
      var base = ndirect + ((((2 + half) << bits) - 4) << npostfix) + 1;
      for (var j = 0; j < postfix; ++j) {
        distExtraBits[i] = bits;
        distOffset[i] = base + j;
        ++i;
      }
      bits = bits + half;
      half = half ^ 1;
    }
  }
  function readMetablockHuffmanCodesAndContextMaps(s) {
    s.numLiteralBlockTypes = decodeVarLenUnsignedByte(s) + 1;
    s.literalBlockLength = readMetablockPartition(s, 0, s.numLiteralBlockTypes);
    s.numCommandBlockTypes = decodeVarLenUnsignedByte(s) + 1;
    s.commandBlockLength = readMetablockPartition(s, 1, s.numCommandBlockTypes);
    s.numDistanceBlockTypes = decodeVarLenUnsignedByte(s) + 1;
    s.distanceBlockLength = readMetablockPartition(s, 2, s.numDistanceBlockTypes);
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    if (s.bitOffset >= 16) {
      s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
      s.bitOffset -= 16;
    }
    s.distancePostfixBits = readFewBits(s, 2);
    s.numDirectDistanceCodes = readFewBits(s, 4) << s.distancePostfixBits;
    s.distancePostfixMask = (1 << s.distancePostfixBits) - 1;
    s.contextModes = new Int8Array(s.numLiteralBlockTypes);
    for (var i = 0; i < s.numLiteralBlockTypes; ) {
      var limit = min(i + 96, s.numLiteralBlockTypes);
      for (; i < limit; ++i) {
        if (s.bitOffset >= 16) {
          s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
          s.bitOffset -= 16;
        }
        s.contextModes[i] = readFewBits(s, 2);
      }
      if (s.halfOffset > 2030) {
        doReadMoreInput(s);
      }
    }
    s.contextMap = new Int8Array(s.numLiteralBlockTypes << 6);
    var numLiteralTrees = decodeContextMap(s.numLiteralBlockTypes << 6, s.contextMap, s);
    s.trivialLiteralContext = 1;
    for (var j = 0; j < s.numLiteralBlockTypes << 6; j++) {
      if (s.contextMap[j] != j >> 6) {
        s.trivialLiteralContext = 0;
        break;
      }
    }
    s.distContextMap = new Int8Array(s.numDistanceBlockTypes << 2);
    var numDistTrees = decodeContextMap(s.numDistanceBlockTypes << 2, s.distContextMap, s);
    s.literalTreeGroup = decodeHuffmanTreeGroup(256, 256, numLiteralTrees, s);
    s.commandTreeGroup = decodeHuffmanTreeGroup(704, 704, s.numCommandBlockTypes, s);
    var distanceAlphabetSizeMax = calculateDistanceAlphabetSize(s.distancePostfixBits, s.numDirectDistanceCodes, 24);
    var distanceAlphabetSizeLimit = distanceAlphabetSizeMax;
    if (s.isLargeWindow == 1) {
      distanceAlphabetSizeMax = calculateDistanceAlphabetSize(s.distancePostfixBits, s.numDirectDistanceCodes, 62);
      distanceAlphabetSizeLimit = calculateDistanceAlphabetLimit(
        2147483644,
        s.distancePostfixBits,
        s.numDirectDistanceCodes
      );
    }
    s.distanceTreeGroup = decodeHuffmanTreeGroup(distanceAlphabetSizeMax, distanceAlphabetSizeLimit, numDistTrees, s);
    calculateDistanceLut(s, distanceAlphabetSizeLimit);
    s.contextMapSlice = 0;
    s.distContextMapSlice = 0;
    s.contextLookupOffset1 = s.contextModes[0] * 512;
    s.contextLookupOffset2 = s.contextLookupOffset1 + 256;
    s.literalTreeIdx = 0;
    s.commandTreeIdx = 0;
    s.rings[4] = 1;
    s.rings[5] = 0;
    s.rings[6] = 1;
    s.rings[7] = 0;
    s.rings[8] = 1;
    s.rings[9] = 0;
  }
  function copyUncompressedData(s) {
    var ringBuffer = s.ringBuffer;
    if (s.metaBlockLength <= 0) {
      reload(s);
      s.runningState = 2;
      return;
    }
    var chunkLength = min(s.ringBufferSize - s.pos, s.metaBlockLength);
    copyBytes(s, ringBuffer, s.pos, chunkLength);
    s.metaBlockLength -= chunkLength;
    s.pos += chunkLength;
    if (s.pos == s.ringBufferSize) {
      s.nextRunningState = 6;
      s.runningState = 12;
      return;
    }
    reload(s);
    s.runningState = 2;
  }
  function writeRingBuffer(s) {
    var toWrite = min(s.outputLength - s.outputUsed, s.ringBufferBytesReady - s.ringBufferBytesWritten);
    if (toWrite != 0) {
      s.output.set(
        s.ringBuffer.subarray(s.ringBufferBytesWritten, s.ringBufferBytesWritten + toWrite),
        s.outputOffset + s.outputUsed
      );
      s.outputUsed += toWrite;
      s.ringBufferBytesWritten += toWrite;
    }
    if (s.outputUsed < s.outputLength) {
      return 1;
    } else {
      return 0;
    }
  }
  function decodeHuffmanTreeGroup(alphabetSizeMax, alphabetSizeLimit, n, s) {
    var maxTableSize = MAX_HUFFMAN_TABLE_SIZE[(alphabetSizeLimit + 31) >> 5];
    var group = new Int32Array(n + n * maxTableSize);
    var next = n;
    for (var i = 0; i < n; ++i) {
      group[i] = next;
      next += readHuffmanCode(alphabetSizeMax, alphabetSizeLimit, group, i, s);
    }
    return group;
  }
  function calculateFence(s) {
    var result = s.ringBufferSize;
    if (s.isEager != 0) {
      result = min(result, s.ringBufferBytesWritten + s.outputLength - s.outputUsed);
    }
    return result;
  }
  function decompress(s) {
    if (s.runningState == 0) {
      throw "Can't decompress until initialized";
    }
    if (s.runningState == 11) {
      throw "Can't decompress after close";
    }
    if (s.runningState == 1) {
      var windowBits = decodeWindowBits(s);
      if (windowBits == -1) {
        throw "Invalid 'windowBits' code";
      }
      s.maxRingBufferSize = 1 << windowBits;
      s.maxBackwardDistance = s.maxRingBufferSize - 16;
      s.runningState = 2;
    }
    var fence = calculateFence(s);
    var ringBufferMask = s.ringBufferSize - 1;
    var ringBuffer = s.ringBuffer;
    while (s.runningState != 10) {
      switch (s.runningState) {
        case 2:
          if (s.metaBlockLength < 0) {
            throw 'Invalid metablock length';
          }
          readNextMetablockHeader(s);
          fence = calculateFence(s);
          ringBufferMask = s.ringBufferSize - 1;
          ringBuffer = s.ringBuffer;
          continue;
        case 3:
          readMetablockHuffmanCodesAndContextMaps(s);
          s.runningState = 4;
        case 4:
          if (s.metaBlockLength <= 0) {
            s.runningState = 2;
            continue;
          }
          if (s.halfOffset > 2030) {
            doReadMoreInput(s);
          }
          if (s.commandBlockLength == 0) {
            decodeCommandBlockSwitch(s);
          }
          s.commandBlockLength--;
          if (s.bitOffset >= 16) {
            s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
            s.bitOffset -= 16;
          }
          var cmdCode = readSymbol(s.commandTreeGroup, s.commandTreeIdx, s) << 2;
          var insertAndCopyExtraBits = CMD_LOOKUP[cmdCode];
          var insertLengthOffset = CMD_LOOKUP[cmdCode + 1];
          var copyLengthOffset = CMD_LOOKUP[cmdCode + 2];
          s.distanceCode = CMD_LOOKUP[cmdCode + 3];
          if (s.bitOffset >= 16) {
            s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
            s.bitOffset -= 16;
          }
          var extraBits = insertAndCopyExtraBits & 255;
          s.insertLength =
            insertLengthOffset + (extraBits <= 16 ? readFewBits(s, extraBits) : readManyBits(s, extraBits));
          if (s.bitOffset >= 16) {
            s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
            s.bitOffset -= 16;
          }
          var extraBits = insertAndCopyExtraBits >> 8;
          s.copyLength = copyLengthOffset + (extraBits <= 16 ? readFewBits(s, extraBits) : readManyBits(s, extraBits));
          s.j = 0;
          s.runningState = 7;
        case 7:
          if (s.trivialLiteralContext != 0) {
            while (s.j < s.insertLength) {
              if (s.halfOffset > 2030) {
                doReadMoreInput(s);
              }
              if (s.literalBlockLength == 0) {
                decodeLiteralBlockSwitch(s);
              }
              s.literalBlockLength--;
              if (s.bitOffset >= 16) {
                s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
                s.bitOffset -= 16;
              }
              ringBuffer[s.pos] = readSymbol(s.literalTreeGroup, s.literalTreeIdx, s);
              s.pos++;
              s.j++;
              if (s.pos >= fence) {
                s.nextRunningState = 7;
                s.runningState = 12;
                break;
              }
            }
          } else {
            var prevByte1 = ringBuffer[(s.pos - 1) & ringBufferMask] & 255;
            var prevByte2 = ringBuffer[(s.pos - 2) & ringBufferMask] & 255;
            while (s.j < s.insertLength) {
              if (s.halfOffset > 2030) {
                doReadMoreInput(s);
              }
              if (s.literalBlockLength == 0) {
                decodeLiteralBlockSwitch(s);
              }
              var literalContext =
                LOOKUP[s.contextLookupOffset1 + prevByte1] | LOOKUP[s.contextLookupOffset2 + prevByte2];
              var literalTreeIdx = s.contextMap[s.contextMapSlice + literalContext] & 255;
              s.literalBlockLength--;
              prevByte2 = prevByte1;
              if (s.bitOffset >= 16) {
                s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
                s.bitOffset -= 16;
              }
              prevByte1 = readSymbol(s.literalTreeGroup, literalTreeIdx, s);
              ringBuffer[s.pos] = prevByte1;
              s.pos++;
              s.j++;
              if (s.pos >= fence) {
                s.nextRunningState = 7;
                s.runningState = 12;
                break;
              }
            }
          }
          if (s.runningState != 7) {
            continue;
          }
          s.metaBlockLength -= s.insertLength;
          if (s.metaBlockLength <= 0) {
            s.runningState = 4;
            continue;
          }
          var distanceCode = s.distanceCode;
          if (distanceCode < 0) {
            s.distance = s.rings[s.distRbIdx];
          } else {
            if (s.halfOffset > 2030) {
              doReadMoreInput(s);
            }
            if (s.distanceBlockLength == 0) {
              decodeDistanceBlockSwitch(s);
            }
            s.distanceBlockLength--;
            if (s.bitOffset >= 16) {
              s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
              s.bitOffset -= 16;
            }
            var distTreeIdx = s.distContextMap[s.distContextMapSlice + distanceCode] & 255;
            distanceCode = readSymbol(s.distanceTreeGroup, distTreeIdx, s);
            if (distanceCode < 16) {
              var index = (s.distRbIdx + DISTANCE_SHORT_CODE_INDEX_OFFSET[distanceCode]) & 3;
              s.distance = s.rings[index] + DISTANCE_SHORT_CODE_VALUE_OFFSET[distanceCode];
              if (s.distance < 0) {
                throw 'Negative distance';
              }
            } else {
              var extraBits = s.distExtraBits[distanceCode];
              var bits;
              if (s.bitOffset + extraBits <= 32) {
                bits = readFewBits(s, extraBits);
              } else {
                if (s.bitOffset >= 16) {
                  s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
                  s.bitOffset -= 16;
                }
                bits = extraBits <= 16 ? readFewBits(s, extraBits) : readManyBits(s, extraBits);
              }
              s.distance = s.distOffset[distanceCode] + (bits << s.distancePostfixBits);
            }
          }
          if (s.maxDistance != s.maxBackwardDistance && s.pos < s.maxBackwardDistance) {
            s.maxDistance = s.pos;
          } else {
            s.maxDistance = s.maxBackwardDistance;
          }
          if (s.distance > s.maxDistance) {
            s.runningState = 9;
            continue;
          }
          if (distanceCode > 0) {
            s.distRbIdx = (s.distRbIdx + 1) & 3;
            s.rings[s.distRbIdx] = s.distance;
          }
          if (s.copyLength > s.metaBlockLength) {
            throw 'Invalid backward reference';
          }
          s.j = 0;
          s.runningState = 8;
        case 8:
          var src = (s.pos - s.distance) & ringBufferMask;
          var dst = s.pos;
          var copyLength = s.copyLength - s.j;
          var srcEnd = src + copyLength;
          var dstEnd = dst + copyLength;
          if (srcEnd < ringBufferMask && dstEnd < ringBufferMask) {
            if (copyLength < 12 || (srcEnd > dst && dstEnd > src)) {
              for (var k = 0; k < copyLength; k += 4) {
                ringBuffer[dst++] = ringBuffer[src++];
                ringBuffer[dst++] = ringBuffer[src++];
                ringBuffer[dst++] = ringBuffer[src++];
                ringBuffer[dst++] = ringBuffer[src++];
              }
            } else {
              ringBuffer.copyWithin(dst, src, srcEnd);
            }
            s.j += copyLength;
            s.metaBlockLength -= copyLength;
            s.pos += copyLength;
          } else {
            for (; s.j < s.copyLength; ) {
              ringBuffer[s.pos] = ringBuffer[(s.pos - s.distance) & ringBufferMask];
              s.metaBlockLength--;
              s.pos++;
              s.j++;
              if (s.pos >= fence) {
                s.nextRunningState = 8;
                s.runningState = 12;
                break;
              }
            }
          }
          if (s.runningState == 8) {
            s.runningState = 4;
          }
          continue;
        case 9:
          if (s.distance > 2147483644) {
            throw 'Invalid backward reference';
          }
          if (s.copyLength >= 4 && s.copyLength <= 24) {
            var offset = DICTIONARY_OFFSETS_BY_LENGTH[s.copyLength];
            var wordId = s.distance - s.maxDistance - 1;
            var shift = DICTIONARY_SIZE_BITS_BY_LENGTH[s.copyLength];
            var mask = (1 << shift) - 1;
            var wordIdx = wordId & mask;
            var transformIdx = wordId >>> shift;
            offset += wordIdx * s.copyLength;
            if (transformIdx < 121) {
              var len = transformDictionaryWord(
                ringBuffer,
                s.pos,
                DICTIONARY_DATA,
                offset,
                s.copyLength,
                RFC_TRANSFORMS,
                transformIdx
              );
              s.pos += len;
              s.metaBlockLength -= len;
              if (s.pos >= fence) {
                s.nextRunningState = 4;
                s.runningState = 12;
                continue;
              }
            } else {
              throw 'Invalid backward reference';
            }
          } else {
            throw 'Invalid backward reference';
          }
          s.runningState = 4;
          continue;
        case 5:
          while (s.metaBlockLength > 0) {
            if (s.halfOffset > 2030) {
              doReadMoreInput(s);
            }
            if (s.bitOffset >= 16) {
              s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
              s.bitOffset -= 16;
            }
            readFewBits(s, 8);
            s.metaBlockLength--;
          }
          s.runningState = 2;
          continue;
        case 6:
          copyUncompressedData(s);
          continue;
        case 12:
          s.ringBufferBytesReady = min(s.pos, s.ringBufferSize);
          s.runningState = 13;
        case 13:
          if (writeRingBuffer(s) == 0) {
            return;
          }
          if (s.pos >= s.maxBackwardDistance) {
            s.maxDistance = s.maxBackwardDistance;
          }
          if (s.pos >= s.ringBufferSize) {
            if (s.pos > s.ringBufferSize) {
              ringBuffer.copyWithin(0, s.ringBufferSize, s.pos);
            }
            s.pos &= ringBufferMask;
            s.ringBufferBytesWritten = 0;
          }
          s.runningState = s.nextRunningState;
          continue;
        default:
          throw 'Unexpected state ' + s.runningState;
      }
    }
    if (s.runningState == 10) {
      if (s.metaBlockLength < 0) {
        throw 'Invalid metablock length';
      }
      jumpToByteBoundary(s);
      checkHealth(s, 1);
    }
  }
  function Transforms(numTransforms, prefixSuffixLen, prefixSuffixCount) {
    this.numTransforms = 0;
    this.triplets = new Int32Array(0);
    this.prefixSuffixStorage = new Int8Array(0);
    this.prefixSuffixHeads = new Int32Array(0);
    this.params = new Int16Array(0);
    this.numTransforms = numTransforms;
    this.triplets = new Int32Array(numTransforms * 3);
    this.params = new Int16Array(numTransforms);
    this.prefixSuffixStorage = new Int8Array(prefixSuffixLen);
    this.prefixSuffixHeads = new Int32Array(prefixSuffixCount + 1);
  }
  var RFC_TRANSFORMS = new Transforms(121, 167, 50);
  function unpackTransforms(prefixSuffix, prefixSuffixHeads, transforms, prefixSuffixSrc, transformsSrc) {
    var n = prefixSuffixSrc.length;
    var index = 1;
    var j = 0;
    for (var i = 0; i < n; ++i) {
      var c = prefixSuffixSrc.charCodeAt(i);
      if (c == 35) {
        prefixSuffixHeads[index++] = j;
      } else {
        prefixSuffix[j++] = c;
      }
    }
    for (var i = 0; i < 363; ++i) {
      transforms[i] = transformsSrc.charCodeAt(i) - 32;
    }
  }
  {
    unpackTransforms(
      RFC_TRANSFORMS.prefixSuffixStorage,
      RFC_TRANSFORMS.prefixSuffixHeads,
      RFC_TRANSFORMS.triplets,
      '# #s #, #e #.# the #.com/#Â # of # and # in # to #"#">#\n#]# for # a # that #. # with #\'# from # by #. The # on # as # is #ing #\n\t#:#ed #(# at #ly #="# of the #. This #,# not #er #al #=\'#ful #ive #less #est #ize #ous #',
      '     !! ! ,  *!  &!  " !  ) *   * -  ! # !  #!*!  +  ,$ !  -  %  .  / #   0  1 .  "   2  3!*   4%  ! # /   5  6  7  8 0  1 &   $   9 +   :  ;  < \'  !=  >  ?! 4  @ 4  2  &   A *# (   B  C& ) %  ) !*# *-% A +! *.  D! %\'  & E *6  F  G% ! *A *%  H! D  I!+!  J!+   K +- *4! A  L!*4  M  N +6  O!*% +.! K *G  P +%(  ! G *D +D  Q +# *K!*G!+D!+# +G +A +4!+% +K!+4!*D!+K!*K'
    );
  }
  function transformDictionaryWord(dst, dstOffset, src, srcOffset, len, transforms, transformIndex) {
    var offset = dstOffset;
    var triplets = transforms.triplets;
    var prefixSuffixStorage = transforms.prefixSuffixStorage;
    var prefixSuffixHeads = transforms.prefixSuffixHeads;
    var transformOffset = 3 * transformIndex;
    var prefixIdx = triplets[transformOffset];
    var transformType = triplets[transformOffset + 1];
    var suffixIdx = triplets[transformOffset + 2];
    var prefix = prefixSuffixHeads[prefixIdx];
    var prefixEnd = prefixSuffixHeads[prefixIdx + 1];
    var suffix = prefixSuffixHeads[suffixIdx];
    var suffixEnd = prefixSuffixHeads[suffixIdx + 1];
    var omitFirst = transformType - 11;
    var omitLast = transformType - 0;
    if (omitFirst < 1 || omitFirst > 9) {
      omitFirst = 0;
    }
    if (omitLast < 1 || omitLast > 9) {
      omitLast = 0;
    }
    while (prefix != prefixEnd) {
      dst[offset++] = prefixSuffixStorage[prefix++];
    }
    if (omitFirst > len) {
      omitFirst = len;
    }
    srcOffset += omitFirst;
    len -= omitFirst;
    len -= omitLast;
    var i = len;
    while (i > 0) {
      dst[offset++] = src[srcOffset++];
      i--;
    }
    if (transformType == 10 || transformType == 11) {
      var uppercaseOffset = offset - len;
      if (transformType == 10) {
        len = 1;
      }
      while (len > 0) {
        var c0 = dst[uppercaseOffset] & 255;
        if (c0 < 192) {
          if (c0 >= 97 && c0 <= 122) {
            dst[uppercaseOffset] ^= 32;
          }
          uppercaseOffset += 1;
          len -= 1;
        } else if (c0 < 224) {
          dst[uppercaseOffset + 1] ^= 32;
          uppercaseOffset += 2;
          len -= 2;
        } else {
          dst[uppercaseOffset + 2] ^= 5;
          uppercaseOffset += 3;
          len -= 3;
        }
      }
    } else if (transformType == 21 || transformType == 22) {
      var shiftOffset = offset - len;
      var param = transforms.params[transformIndex];
      var scalar = (param & 32767) + (16777216 - (param & 32768));
      while (len > 0) {
        var step = 1;
        var c0 = dst[shiftOffset] & 255;
        if (c0 < 128) {
          scalar += c0;
          dst[shiftOffset] = scalar & 127;
        } else if (c0 < 192) {
        } else if (c0 < 224) {
          if (len >= 2) {
            var c1 = dst[shiftOffset + 1];
            scalar += (c1 & 63) | ((c0 & 31) << 6);
            dst[shiftOffset] = 192 | ((scalar >> 6) & 31);
            dst[shiftOffset + 1] = (c1 & 192) | (scalar & 63);
            step = 2;
          } else {
            step = len;
          }
        } else if (c0 < 240) {
          if (len >= 3) {
            var c1 = dst[shiftOffset + 1];
            var c2 = dst[shiftOffset + 2];
            scalar += (c2 & 63) | ((c1 & 63) << 6) | ((c0 & 15) << 12);
            dst[shiftOffset] = 224 | ((scalar >> 12) & 15);
            dst[shiftOffset + 1] = (c1 & 192) | ((scalar >> 6) & 63);
            dst[shiftOffset + 2] = (c2 & 192) | (scalar & 63);
            step = 3;
          } else {
            step = len;
          }
        } else if (c0 < 248) {
          if (len >= 4) {
            var c1 = dst[shiftOffset + 1];
            var c2 = dst[shiftOffset + 2];
            var c3 = dst[shiftOffset + 3];
            scalar += (c3 & 63) | ((c2 & 63) << 6) | ((c1 & 63) << 12) | ((c0 & 7) << 18);
            dst[shiftOffset] = 240 | ((scalar >> 18) & 7);
            dst[shiftOffset + 1] = (c1 & 192) | ((scalar >> 12) & 63);
            dst[shiftOffset + 2] = (c2 & 192) | ((scalar >> 6) & 63);
            dst[shiftOffset + 3] = (c3 & 192) | (scalar & 63);
            step = 4;
          } else {
            step = len;
          }
        }
        shiftOffset += step;
        len -= step;
        if (transformType == 21) {
          len = 0;
        }
      }
    }
    while (suffix != suffixEnd) {
      dst[offset++] = prefixSuffixStorage[suffix++];
    }
    return offset - dstOffset;
  }
  function getNextKey(key, len) {
    var step = 1 << (len - 1);
    while ((key & step) != 0) {
      step >>= 1;
    }
    return (key & (step - 1)) + step;
  }
  function replicateValue(table, offset, step, end, item) {
    do {
      end -= step;
      table[offset + end] = item;
    } while (end > 0);
  }
  function nextTableBitSize(count, len, rootBits) {
    var left = 1 << (len - rootBits);
    while (len < 15) {
      left -= count[len];
      if (left <= 0) {
        break;
      }
      len++;
      left <<= 1;
    }
    return len - rootBits;
  }
  function buildHuffmanTable(tableGroup, tableIdx, rootBits, codeLengths, codeLengthsSize) {
    var tableOffset = tableGroup[tableIdx];
    var key;
    var sorted = new Int32Array(codeLengthsSize);
    var count = new Int32Array(16);
    var offset = new Int32Array(16);
    var symbol;
    for (symbol = 0; symbol < codeLengthsSize; symbol++) {
      count[codeLengths[symbol]]++;
    }
    offset[1] = 0;
    for (var len = 1; len < 15; len++) {
      offset[len + 1] = offset[len] + count[len];
    }
    for (symbol = 0; symbol < codeLengthsSize; symbol++) {
      if (codeLengths[symbol] != 0) {
        sorted[offset[codeLengths[symbol]]++] = symbol;
      }
    }
    var tableBits = rootBits;
    var tableSize = 1 << tableBits;
    var totalSize = tableSize;
    if (offset[15] == 1) {
      for (key = 0; key < totalSize; key++) {
        tableGroup[tableOffset + key] = sorted[0];
      }
      return totalSize;
    }
    key = 0;
    symbol = 0;
    for (var len = 1, step = 2; len <= rootBits; len++, step <<= 1) {
      for (; count[len] > 0; count[len]--) {
        replicateValue(tableGroup, tableOffset + key, step, tableSize, (len << 16) | sorted[symbol++]);
        key = getNextKey(key, len);
      }
    }
    var mask = totalSize - 1;
    var low = -1;
    var currentOffset = tableOffset;
    for (var len = rootBits + 1, step = 2; len <= 15; len++, step <<= 1) {
      for (; count[len] > 0; count[len]--) {
        if ((key & mask) != low) {
          currentOffset += tableSize;
          tableBits = nextTableBitSize(count, len, rootBits);
          tableSize = 1 << tableBits;
          totalSize += tableSize;
          low = key & mask;
          tableGroup[tableOffset + low] = ((tableBits + rootBits) << 16) | (currentOffset - tableOffset - low);
        }
        replicateValue(
          tableGroup,
          currentOffset + (key >> rootBits),
          step,
          tableSize,
          ((len - rootBits) << 16) | sorted[symbol++]
        );
        key = getNextKey(key, len);
      }
    }
    return totalSize;
  }
  function doReadMoreInput(s) {
    if (s.endOfStreamReached != 0) {
      if (halfAvailable(s) >= -2) {
        return;
      }
      throw 'No more input';
    }
    var readOffset = s.halfOffset << 1;
    var bytesInBuffer = 4096 - readOffset;
    s.byteBuffer.copyWithin(0, readOffset, 4096);
    s.halfOffset = 0;
    while (bytesInBuffer < 4096) {
      var spaceLeft = 4096 - bytesInBuffer;
      var len = readInput(s.input, s.byteBuffer, bytesInBuffer, spaceLeft);
      if (len <= 0) {
        s.endOfStreamReached = 1;
        s.tailBytes = bytesInBuffer;
        bytesInBuffer += 1;
        break;
      }
      bytesInBuffer += len;
    }
    bytesToNibbles(s, bytesInBuffer);
  }
  function checkHealth(s, endOfStream) {
    if (s.endOfStreamReached == 0) {
      return;
    }
    var byteOffset = (s.halfOffset << 1) + ((s.bitOffset + 7) >> 3) - 4;
    if (byteOffset > s.tailBytes) {
      throw 'Read after end';
    }
    if (endOfStream != 0 && byteOffset != s.tailBytes) {
      throw 'Unused bytes after end';
    }
  }
  function readFewBits(s, n) {
    var val = (s.accumulator32 >>> s.bitOffset) & ((1 << n) - 1);
    s.bitOffset += n;
    return val;
  }
  function readManyBits(s, n) {
    var low = readFewBits(s, 16);
    s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
    s.bitOffset -= 16;
    return low | (readFewBits(s, n - 16) << 16);
  }
  function initBitReader(s) {
    s.byteBuffer = new Int8Array(4160);
    s.accumulator32 = 0;
    s.shortBuffer = new Int16Array(2080);
    s.bitOffset = 32;
    s.halfOffset = 2048;
    s.endOfStreamReached = 0;
    prepare(s);
  }
  function prepare(s) {
    if (s.halfOffset > 2030) {
      doReadMoreInput(s);
    }
    checkHealth(s, 0);
    s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
    s.bitOffset -= 16;
    s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
    s.bitOffset -= 16;
  }
  function reload(s) {
    if (s.bitOffset == 32) {
      prepare(s);
    }
  }
  function jumpToByteBoundary(s) {
    var padding = (32 - s.bitOffset) & 7;
    if (padding != 0) {
      var paddingBits = readFewBits(s, padding);
      if (paddingBits != 0) {
        throw 'Corrupted padding bits';
      }
    }
  }
  function halfAvailable(s) {
    var limit = 2048;
    if (s.endOfStreamReached != 0) {
      limit = (s.tailBytes + 1) >> 1;
    }
    return limit - s.halfOffset;
  }
  function copyBytes(s, data, offset, length) {
    if ((s.bitOffset & 7) != 0) {
      throw 'Unaligned copyBytes';
    }
    while (s.bitOffset != 32 && length != 0) {
      data[offset++] = s.accumulator32 >>> s.bitOffset;
      s.bitOffset += 8;
      length--;
    }
    if (length == 0) {
      return;
    }
    var copyNibbles = min(halfAvailable(s), length >> 1);
    if (copyNibbles > 0) {
      var readOffset = s.halfOffset << 1;
      var delta = copyNibbles << 1;
      data.set(s.byteBuffer.subarray(readOffset, readOffset + delta), offset);
      offset += delta;
      length -= delta;
      s.halfOffset += copyNibbles;
    }
    if (length == 0) {
      return;
    }
    if (halfAvailable(s) > 0) {
      if (s.bitOffset >= 16) {
        s.accumulator32 = (s.shortBuffer[s.halfOffset++] << 16) | (s.accumulator32 >>> 16);
        s.bitOffset -= 16;
      }
      while (length != 0) {
        data[offset++] = s.accumulator32 >>> s.bitOffset;
        s.bitOffset += 8;
        length--;
      }
      checkHealth(s, 0);
      return;
    }
    while (length > 0) {
      var len = readInput(s.input, data, offset, length);
      if (len == -1) {
        throw 'Unexpected end of input';
      }
      offset += len;
      length -= len;
    }
  }
  function bytesToNibbles(s, byteLen) {
    var byteBuffer = s.byteBuffer;
    var halfLen = byteLen >> 1;
    var shortBuffer = s.shortBuffer;
    for (var i = 0; i < halfLen; ++i) {
      shortBuffer[i] = (byteBuffer[i * 2] & 255) | ((byteBuffer[i * 2 + 1] & 255) << 8);
    }
  }
  var LOOKUP = new Int32Array(2048);
  function unpackLookupTable(lookup, map, rle) {
    for (var i = 0; i < 256; ++i) {
      lookup[i] = i & 63;
      lookup[512 + i] = i >> 2;
      lookup[1792 + i] = 2 + (i >> 6);
    }
    for (var i = 0; i < 128; ++i) {
      lookup[1024 + i] = 4 * (map.charCodeAt(i) - 32);
    }
    for (var i = 0; i < 64; ++i) {
      lookup[1152 + i] = i & 1;
      lookup[1216 + i] = 2 + (i & 1);
    }
    var offset = 1280;
    for (var k = 0; k < 19; ++k) {
      var value = k & 3;
      var rep = rle.charCodeAt(k) - 32;
      for (var i = 0; i < rep; ++i) {
        lookup[offset++] = value;
      }
    }
    for (var i = 0; i < 16; ++i) {
      lookup[1792 + i] = 1;
      lookup[2032 + i] = 6;
    }
    lookup[1792] = 0;
    lookup[2047] = 7;
    for (var i = 0; i < 256; ++i) {
      lookup[1536 + i] = lookup[1792 + i] << 3;
    }
  }
  {
    unpackLookupTable(
      LOOKUP,
      "         !!  !                  \"#$##%#$&'##(#)#++++++++++((&*'##,---,---,-----,-----,-----&#'###.///.///./////./////./////&#'# ",
      "A/*  ':  & : $   @"
    );
  }
  function State() {
    this.ringBuffer = new Int8Array(0);
    this.contextModes = new Int8Array(0);
    this.contextMap = new Int8Array(0);
    this.distContextMap = new Int8Array(0);
    this.distExtraBits = new Int8Array(0);
    this.output = new Int8Array(0);
    this.byteBuffer = new Int8Array(0);
    this.shortBuffer = new Int16Array(0);
    this.intBuffer = new Int32Array(0);
    this.rings = new Int32Array(0);
    this.blockTrees = new Int32Array(0);
    this.literalTreeGroup = new Int32Array(0);
    this.commandTreeGroup = new Int32Array(0);
    this.distanceTreeGroup = new Int32Array(0);
    this.distOffset = new Int32Array(0);
    this.runningState = 0;
    this.nextRunningState = 0;
    this.accumulator32 = 0;
    this.bitOffset = 0;
    this.halfOffset = 0;
    this.tailBytes = 0;
    this.endOfStreamReached = 0;
    this.metaBlockLength = 0;
    this.inputEnd = 0;
    this.isUncompressed = 0;
    this.isMetadata = 0;
    this.literalBlockLength = 0;
    this.numLiteralBlockTypes = 0;
    this.commandBlockLength = 0;
    this.numCommandBlockTypes = 0;
    this.distanceBlockLength = 0;
    this.numDistanceBlockTypes = 0;
    this.pos = 0;
    this.maxDistance = 0;
    this.distRbIdx = 0;
    this.trivialLiteralContext = 0;
    this.literalTreeIdx = 0;
    this.commandTreeIdx = 0;
    this.j = 0;
    this.insertLength = 0;
    this.contextMapSlice = 0;
    this.distContextMapSlice = 0;
    this.contextLookupOffset1 = 0;
    this.contextLookupOffset2 = 0;
    this.distanceCode = 0;
    this.numDirectDistanceCodes = 0;
    this.distancePostfixMask = 0;
    this.distancePostfixBits = 0;
    this.distance = 0;
    this.copyLength = 0;
    this.maxBackwardDistance = 0;
    this.maxRingBufferSize = 0;
    this.ringBufferSize = 0;
    this.expectedTotalSize = 0;
    this.outputOffset = 0;
    this.outputLength = 0;
    this.outputUsed = 0;
    this.ringBufferBytesWritten = 0;
    this.ringBufferBytesReady = 0;
    this.isEager = 0;
    this.isLargeWindow = 0;
    this.input = null;
    this.ringBuffer = new Int8Array(0);
    this.rings = new Int32Array(10);
    this.rings[0] = 16;
    this.rings[1] = 15;
    this.rings[2] = 11;
    this.rings[3] = 4;
  }
  function unpackDictionaryData(dictionary, data0, data1, skipFlip) {
    var dict = toUsAsciiBytes(data0 + data1);
    if (dict.length != dictionary.length) {
      throw 'Corrupted brotli dictionary';
    }
    var offset = 0;
    var n = skipFlip.length;
    for (var i = 0; i < n; i += 2) {
      var skip = skipFlip.charCodeAt(i) - 36;
      var flip = skipFlip.charCodeAt(i + 1) - 36;
      offset += skip;
      for (var j = 0; j < flip; ++j) {
        dict[offset] |= 128;
        offset++;
      }
    }
    dictionary.set(dict);
  }
  {
    var dictionary = new Int8Array(122784);
    unpackDictionaryData(
      dictionary,
      'timedownlifeleftbackcodedatashowonlysitecityopenjustlikefreeworktextyearoverbodyloveformbookplaylivelinehelphomesidemorewordlongthemviewfindpagedaysfullheadtermeachareafromtruemarkableuponhighdatelandnewsevennextcasebothpostusedmadehandherewhatnameLinkblogsizebaseheldmakemainuser\') +holdendswithNewsreadweresigntakehavegameseencallpathwellplusmenufilmpartjointhislistgoodneedwayswestjobsmindalsologorichuseslastteamarmyfoodkingwilleastwardbestfirePageknowaway.pngmovethanloadgiveselfnotemuchfeedmanyrockicononcelookhidediedHomerulehostajaxinfoclublawslesshalfsomesuchzone100%onescareTimeracebluefourweekfacehopegavehardlostwhenparkkeptpassshiproomHTMLplanTypedonesavekeepflaglinksoldfivetookratetownjumpthusdarkcardfilefearstaykillthatfallautoever.comtalkshopvotedeepmoderestturnbornbandfellroseurl(skinrolecomeactsagesmeetgold.jpgitemvaryfeltthensenddropViewcopy1.0"</a>stopelseliestourpack.gifpastcss?graymean&gt;rideshotlatesaidroadvar feeljohnrickportfast\'UA-dead</b>poorbilltypeU.S.woodmust2px;Inforankwidewantwalllead[0];paulwavesure$(\'#waitmassarmsgoesgainlangpaid!-- lockunitrootwalkfirmwifexml"songtest20pxkindrowstoolfontmailsafestarmapscorerainflowbabyspansays4px;6px;artsfootrealwikiheatsteptriporg/lakeweaktoldFormcastfansbankveryrunsjulytask1px;goalgrewslowedgeid="sets5px;.js?40pxif (soonseatnonetubezerosentreedfactintogiftharm18pxcamehillboldzoomvoideasyringfillpeakinitcost3px;jacktagsbitsrolleditknewnear\x3c!--growJSONdutyNamesaleyou lotspainjazzcoldeyesfishwww.risktabsprev10pxrise25pxBlueding300,ballfordearnwildbox.fairlackverspairjunetechif(!pickevil$("#warmlorddoespull,000ideadrawhugespotfundburnhrefcellkeystickhourlossfuel12pxsuitdealRSS"agedgreyGET"easeaimsgirlaids8px;navygridtips#999warsladycars); }php?helltallwhomzh:e*/\r\n 100hall.\n\nA7px;pushchat0px;crew*/</hash75pxflatrare && tellcampontolaidmissskiptentfinemalegetsplot400,\r\n\r\ncoolfeet.php<br>ericmostguidbelldeschairmathatom/img&#82luckcent000;tinygonehtmlselldrugFREEnodenick?id=losenullvastwindRSS wearrelybeensamedukenasacapewishgulfT23:hitsslotgatekickblurthey15px\'\'););">msiewinsbirdsortbetaseekT18:ordstreemall60pxfarmb\0sboys[0].\');"POSTbearkids);}}marytend(UK)quadzh:f-siz----prop\');\rliftT19:viceandydebt>RSSpoolneckblowT16:doorevalT17:letsfailoralpollnovacolsgene b\0softrometillross<h3>pourfadepink<tr>mini)|!(minezh:hbarshear00);milk --\x3eironfreddiskwentsoilputs/js/holyT22:ISBNT20:adamsees<h2>json\', \'contT21: RSSloopasiamoon</p>soulLINEfortcartT14:<h1>80px!--<9px;T04:mike:46ZniceinchYorkricezh:d\'));puremageparatonebond:37Z_of_\']);000,zh:gtankyardbowlbush:56ZJava30px\n|}\n%C3%:34ZjeffEXPIcashvisagolfsnowzh:iquer.csssickmeatmin.binddellhirepicsrent:36ZHTTP-201fotowolfEND xbox:54ZBODYdick;\n}\nexit:35Zvarsbeat\'});diet999;anne}}</[i].LangkmB2wiretoysaddssealalex;\n\t}echonine.org005)tonyjewssandlegsroof000) 200winegeardogsbootgarycutstyletemption.xmlcockgang$(\'.50pxPh.Dmiscalanloandeskmileryanunixdisc);}\ndustclip).\n\n70px-200DVDs7]><tapedemoi++)wageeurophiloptsholeFAQsasin-26TlabspetsURL bulkcook;}\r\nHEAD[0])abbrjuan(198leshtwin</i>sonyguysfuckpipe|-\n!002)ndow[1];[];\nLog salt\r\n\t\tbangtrimbath){\r\n00px\n});ko:lfeesad>\rs:// [];tollplug(){\n{\r\n .js\'200pdualboat.JPG);\n}quot);\n\n\');\n\r\n}\r201420152016201720182019202020212022202320242025202620272028202920302031203220332034203520362037201320122011201020092008200720062005200420032002200120001999199819971996199519941993199219911990198919881987198619851984198319821981198019791978197719761975197419731972197119701969196819671966196519641963196219611960195919581957195619551954195319521951195010001024139400009999comomC!sesteestaperotodohacecadaaC1obiendC-aasC-vidacasootroforosolootracualdijosidograntipotemadebealgoquC)estonadatrespococasabajotodasinoaguapuesunosantediceluisellamayozonaamorpisoobraclicellodioshoracasiP7P0P=P0P>P<Q\0P0Q\0QQP0P=P5P?P>P>QP8P7P=P>P4P>QP>P6P5P>P=P8QPP0P5P5P1Q\vP<Q\vPQ\vQP>P2Q\vP2P>PP>P>P1PP>P;P8P=P8P P$PP5PQ\vQQ\vPP=P8P<P4P0PP0PP0PQPP1QP5PP7P5P9P=QP<P<P"Q\vQP6YY\nX#YYX\'YX9YYX#Y\bX1X/Y\nX\'YY\tYY\bYYYYX\'Y\bYYX(X3X\'YX%YYY\nX#Y\nYX/YYX+YX(YYY\bYY\nX(YX\'Y\nX(YX4Y\nX\'YX#YYX*X(Y\nYYX-X(YYYX4Y\bX4firstvideolightworldmediawhitecloseblackrightsmallbooksplacemusicfieldorderpointvalueleveltableboardhousegroupworksyearsstatetodaywaterstartstyledeathpowerphonenighterrorinputabouttermstitletoolseventlocaltimeslargewordsgamesshortspacefocusclearmodelblockguideradiosharewomenagainmoneyimagenamesyounglineslatercolorgreenfront&amp;watchforcepricerulesbeginaftervisitissueareasbelowindextotalhourslabelprintpressbuiltlinksspeedstudytradefoundsenseundershownformsrangeaddedstillmovedtakenaboveflashfixedoftenotherviewschecklegalriveritemsquickshapehumanexistgoingmoviethirdbasicpeacestagewidthloginideaswrotepagesusersdrivestorebreaksouthvoicesitesmonthwherebuildwhichearthforumthreesportpartyClicklowerlivesclasslayerentrystoryusagesoundcourtyour birthpopuptypesapplyImagebeinguppernoteseveryshowsmeansextramatchtrackknownearlybegansuperpapernorthlearngivennamedendedTermspartsGroupbrandusingwomanfalsereadyaudiotakeswhile.com/livedcasesdailychildgreatjudgethoseunitsneverbroadcoastcoverapplefilescyclesceneplansclickwritequeenpieceemailframeolderphotolimitcachecivilscaleenterthemetheretouchboundroyalaskedwholesincestock namefaithheartemptyofferscopeownedmightalbumthinkbloodarraymajortrustcanonunioncountvalidstoneStyleLoginhappyoccurleft:freshquitefilmsgradeneedsurbanfightbasishoverauto;route.htmlmixedfinalYour slidetopicbrownalonedrawnsplitreachRightdatesmarchquotegoodsLinksdoubtasyncthumballowchiefyouthnovel10px;serveuntilhandsCheckSpacequeryjamesequaltwice0,000Startpanelsongsroundeightshiftworthpostsleadsweeksavoidthesemilesplanesmartalphaplantmarksratesplaysclaimsalestextsstarswrong</h3>thing.org/multiheardPowerstandtokensolid(thisbringshipsstafftriedcallsfullyfactsagentThis //--\x3eadminegyptEvent15px;Emailtrue"crossspentblogsbox">notedleavechinasizesguest</h4>robotheavytrue,sevengrandcrimesignsawaredancephase>\x3c!--en_US&#39;200px_namelatinenjoyajax.ationsmithU.S. holdspeterindianav">chainscorecomesdoingpriorShare1990sromanlistsjapanfallstrialowneragree</h2>abusealertopera"-//WcardshillsteamsPhototruthclean.php?saintmetallouismeantproofbriefrow">genretrucklooksValueFrame.net/--\x3e\n<try {\nvar makescostsplainadultquesttrainlaborhelpscausemagicmotortheir250pxleaststepsCountcouldglasssidesfundshotelawardmouthmovesparisgivesdutchtexasfruitnull,||[];top">\n\x3c!--POST"ocean<br/>floorspeakdepth sizebankscatchchart20px;aligndealswould50px;url="parksmouseMost ...</amongbrainbody none;basedcarrydraftreferpage_home.meterdelaydreamprovejoint</tr>drugs\x3c!-- aprilidealallenexactforthcodeslogicView seemsblankports (200saved_linkgoalsgrantgreekhomesringsrated30px;whoseparse();" Blocklinuxjonespixel\');">);if(-leftdavidhorseFocusraiseboxesTrackement</em>bar">.src=toweralt="cablehenry24px;setupitalysharpminortastewantsthis.resetwheelgirls/css/100%;clubsstuffbiblevotes 1000korea});\r\nbandsqueue= {};80px;cking{\r\n\t\taheadclockirishlike ratiostatsForm"yahoo)[0];Aboutfinds</h1>debugtasksURL =cells})();12px;primetellsturns0x600.jpg"spainbeachtaxesmicroangel--\x3e</giftssteve-linkbody.});\n\tmount (199FAQ</rogerfrankClass28px;feeds<h1><scotttests22px;drink) || lewisshall#039; for lovedwaste00px;ja:csimon<fontreplymeetsuntercheaptightBrand) != dressclipsroomsonkeymobilmain.Name platefunnytreescom/"1.jpgwmodeparamSTARTleft idden, 201);\n}\nform.viruschairtransworstPagesitionpatch\x3c!--\no-cacfirmstours,000 asiani++){adobe\')[0]id=10both;menu .2.mi.png"kevincoachChildbruce2.jpgURL)+.jpg|suitesliceharry120" sweettr>\r\nname=diegopage swiss--\x3e\n\n#fff;">Log.com"treatsheet) && 14px;sleepntentfiledja:cid="cName"worseshots-box-delta\n&lt;bears:48Z<data-rural</a> spendbakershops= "";php">ction13px;brianhellosize=o=%2F joinmaybe<img img">, fjsimg" ")[0]MTopBType"newlyDanskczechtrailknows</h5>faq">zh-cn10);\n-1");type=bluestrulydavis.js\';>\r\n<!steel you h2>\r\nform jesus100% menu.\r\n\t\r\nwalesrisksumentddingb-likteachgif" vegasdanskeestishqipsuomisobredesdeentretodospuedeaC1osestC!tienehastaotrospartedondenuevohacerformamismomejormundoaquC-dC-assC3loayudafechatodastantomenosdatosotrassitiomuchoahoralugarmayorestoshorastenerantesfotosestaspaC-snuevasaludforosmedioquienmesespoderchileserC!vecesdecirjosC)estarventagrupohechoellostengoamigocosasnivelgentemismaairesjuliotemashaciafavorjuniolibrepuntobuenoautorabrilbuenatextomarzosaberlistaluegocC3moenerojuegoperC:haberestoynuncamujervalorfueralibrogustaigualvotoscasosguC-apuedosomosavisousteddebennochebuscafaltaeurosseriedichocursoclavecasasleC3nplazolargoobrasvistaapoyojuntotratavistocrearcampohemoscincocargopisosordenhacenC!readiscopedrocercapuedapapelmenorC:tilclarojorgecalleponertardenadiemarcasigueellassiglocochemotosmadreclaserestoniC1oquedapasarbancohijosviajepabloC)stevienereinodejarfondocanalnorteletracausatomarmanoslunesautosvillavendopesartipostengamarcollevapadreunidovamoszonasambosbandamariaabusomuchasubirriojavivirgradochicaallC-jovendichaestantalessalirsuelopesosfinesllamabuscoC)stalleganegroplazahumorpagarjuntadobleislasbolsabaC1ohablaluchaCreadicenjugarnotasvalleallC!cargadolorabajoestC)gustomentemariofirmacostofichaplatahogarartesleyesaquelmuseobasespocosmitadcielochicomiedoganarsantoetapadebesplayaredessietecortecoreadudasdeseoviejodeseaaguas&quot;domaincommonstatuseventsmastersystemactionbannerremovescrollupdateglobalmediumfilternumberchangeresultpublicscreenchoosenormaltravelissuessourcetargetspringmodulemobileswitchphotosborderregionitselfsocialactivecolumnrecordfollowtitle>eitherlengthfamilyfriendlayoutauthorcreatereviewsummerserverplayedplayerexpandpolicyformatdoublepointsseriespersonlivingdesignmonthsforcesuniqueweightpeopleenergynaturesearchfigurehavingcustomoffsetletterwindowsubmitrendergroupsuploadhealthmethodvideosschoolfutureshadowdebatevaluesObjectothersrightsleaguechromesimplenoticesharedendingseasonreportonlinesquarebuttonimagesenablemovinglatestwinterFranceperiodstrongrepeatLondondetailformeddemandsecurepassedtoggleplacesdevicestaticcitiesstreamyellowattackstreetflighthiddeninfo">openedusefulvalleycausesleadersecretseconddamagesportsexceptratingsignedthingseffectfieldsstatesofficevisualeditorvolumeReportmuseummoviesparentaccessmostlymother" id="marketgroundchancesurveybeforesymbolmomentspeechmotioninsidematterCenterobjectexistsmiddleEuropegrowthlegacymannerenoughcareeransweroriginportalclientselectrandomclosedtopicscomingfatheroptionsimplyraisedescapechosenchurchdefinereasoncorneroutputmemoryiframepolicemodelsNumberduringoffersstyleskilledlistedcalledsilvermargindeletebetterbrowselimitsGlobalsinglewidgetcenterbudgetnowrapcreditclaimsenginesafetychoicespirit-stylespreadmakingneededrussiapleaseextentScriptbrokenallowschargedividefactormember-basedtheoryconfigaroundworkedhelpedChurchimpactshouldalwayslogo" bottomlist">){var prefixorangeHeader.push(couplegardenbridgelaunchReviewtakingvisionlittledatingButtonbeautythemesforgotSearchanchoralmostloadedChangereturnstringreloadMobileincomesupplySourceordersviewed&nbsp;courseAbout island<html cookiename="amazonmodernadvicein</a>: The dialoghousesBEGIN MexicostartscentreheightaddingIslandassetsEmpireSchooleffortdirectnearlymanualSelect.\n\nOnejoinedmenu">PhilipawardshandleimportOfficeregardskillsnationSportsdegreeweekly (e.g.behinddoctorloggedunited</b></beginsplantsassistartistissued300px|canadaagencyschemeremainBrazilsamplelogo">beyond-scaleacceptservedmarineFootercamera</h1>\n_form"leavesstress" />\r\n.gif" onloadloaderOxfordsistersurvivlistenfemaleDesignsize="appealtext">levelsthankshigherforcedanimalanyoneAfricaagreedrecentPeople<br />wonderpricesturned|| {};main">inlinesundaywrap">failedcensusminutebeaconquotes150px|estateremoteemail"linkedright;signalformal1.htmlsignupprincefloat:.png" forum.AccesspaperssoundsextendHeightsliderUTF-8"&amp; Before. WithstudioownersmanageprofitjQueryannualparamsboughtfamousgooglelongeri++) {israelsayingdecidehome">headerensurebranchpiecesblock;statedtop"><racingresize--&gt;pacitysexualbureau.jpg" 10,000obtaintitlesamount, Inc.comedymenu" lyricstoday.indeedcounty_logo.FamilylookedMarketlse ifPlayerturkey);var forestgivingerrorsDomain}else{insertBlog</footerlogin.fasteragents<body 10px 0pragmafridayjuniordollarplacedcoversplugin5,000 page">boston.test(avatartested_countforumsschemaindex,filledsharesreaderalert(appearSubmitline">body">\n* TheThoughseeingjerseyNews</verifyexpertinjurywidth=CookieSTART across_imagethreadnativepocketbox">\nSystem DavidcancertablesprovedApril reallydriveritem">more">boardscolorscampusfirst || [];media.guitarfinishwidth:showedOther .php" assumelayerswilsonstoresreliefswedenCustomeasily your String\n\nWhiltaylorclear:resortfrenchthough") + "<body>buyingbrandsMembername">oppingsector5px;">vspacepostermajor coffeemartinmaturehappen</nav>kansaslink">Images=falsewhile hspace0&amp; \n\nIn  powerPolski-colorjordanBottomStart -count2.htmlnews">01.jpgOnline-rightmillerseniorISBN 00,000 guidesvalue)ectionrepair.xml"  rights.html-blockregExp:hoverwithinvirginphones</tr>\rusing \n\tvar >\');\n\t</td>\n</tr>\nbahasabrasilgalegomagyarpolskisrpskiX1X/Y\bd8-fg.\0d=g9i+d?!f/d8-e=f\bd;,d8\0d8*e,e8g.!gh.:ee/d;%f\re\n!f6i4d8*d::d:\'eh*e71d<d8f%g\ve7%d=hg3;f2!f\tg=g+f\t\0f\th/h.:d8-e?fg+ g(f\b7i&i!5d=h\0f\n\0f/i.i"g8e3d8\vh==fg4"d=?g(h=/d;6e(g:?d8;i"h5fh\'i"ee$\rf3(e\fg=g;f6hee.9f(h\re8e:f6\bf/g):i4ee8d;\0d9\be%=e\vgf4;e>g\tee1e&ff\t\vf:f0i;f\0f0f9e<e\fd:,fd>e3d:f4e$h?d8*g3;g;g%if88f\be9?e\ne6d;eh!(e.\te(g,,d8\0d<eh?h!\fg9e;g\t\bfg5e-d8g\fh.>h.!e\rh49fh2e\n e%f4;e\n(d;d;,eee\re."g0e(d8\nf57e&d=e72g;gh(\0h/&g;g$>e\f:g;e=f,g+i\0h&d;7f <f/f\fe=ii>f%e=e.6e;:h.>f\ve\vih/;f3e>\vd=\rg=.g;f5i\0\tf\v)h?f 7e=e\t\re\bg1;fh!\fe d8:d:$ff\0ei3d9d8\rh=i\0h?h!\fd8g\'f\n\0e/h=h.>e$e\bd=e$\'e.6g$>d<g g)6d8d8e(i(i!9g.h?i\fh?f/e<\0e\'\vfe5g5hfd;6eg\t\fe8.e\n)fe\fh5f:e$\'e-&e-&d9 e0e\0f5h\'\bf\nh5e7%g(\vh&f1f\0d9\bf6e\0e\nh=d8;h&g.e\t\rh5h./ee8f9f3g5e=1f\vhe#0fd;;d=e%e:7f0f\r.g>e=f1=h=&d;\vg;\rd=f/d:$f5gd:\'f\t\0d;%g5h/f>g$:d8\0d:e\rd=\rd::ee\bfe0e>ff88e7%e7e-&gg3;e\bg=e\ve8e-e/g i"if\'e\b6e0e\f:e:f,e(e=g=d8\ni\rh&g,,d:\fef,"h?e%e\vfh?d:h\0h/eg0e9h.-d;%d8\nf?e:f\bd8:g/e"i&f8/e\ff6e(1d9ei\0d8\0e.e<\0ed=ef ef,"h?h\'#e3e0f9d8\0d8\vd;%e\nh4#d;;f\bh\0e."f\b7d;#h!(g\'/e\be%3d::f0g i\0e.e:g0g&;g:?e:g(e\bh!(d8\re\fg<h>g;h.!f%h/"d8\rh&f\te3f:fe>\be$f-f>g;g;f?g-g4f%h=e\nf%f:fig\ve\b0g-i(e3i.d8e\f:ie88h\v1h/-g>e:&e8\ffg>e%3f/h>g%h/h\'e.e;:h..i(i(fh\'g2>e=)f%f,fi+eh(\0f9i"e:ie$gfie=1g\ti6h!\fh?f\te\bd:+g\t)eg;h%f7;e\n d8e.6h?g\'\rh/i"h57f%d8e\n!e,e\nh.0e=g.\0d;\vh4(ig7d::e=1e\re<g(f\n%e\ni(e\be?+i\0e(h/"f6e0f3(fg3h/7e-&f !e:h/%ee2e*f/h?eh4-d90e\rg\'0d8:d:f\be\nh/4fd>e:e-)e-d8i"g(\ve:d8\0h\b,fe!e*f\te6e.d?f\n$h\0\fd8d;\ne$)g*e#e\n(f\0g\n6f\0g\t9e\b+h.$d8:e?i!;f4f0e0h/4f\be\0d=d8:e*d=e\ff\v,i#d9\bd8\0f 7e=ef/e&f 9f\r.g5h\'e-&i"e7f\th?g(\vg1d:d::f\t\re:f%d8\rh?f-#e(fffd:\ve3g3;f i"ee\n!h>e%d8\0g4e:g!\0fe-&d:h\'#e;:g-g;fe(gi\0g%h.!e\be/9d:h\t:f/g8e\feggge;:g+\vg-\tg:\'g1;e\vg;i*\fe.g0e\b6d=f%h*f g->d;%d8\vee\bf f3e6d8-e\0\vd::d8\0e\bf\fe\re3i-ie"g,,d8\te3f3(e f-$g\'g\tf71e3ed8e9?e7f%fi+g:\'f\0h?g;<e\bh!(g$:d8h>h!\fd8:d:$i\0h/d;7h\'\te>g2>e\re.6e:-e.\ff\bfh\'\te.\th#e>e\b0i.d;6e\b6e:&i#eh=g6h=,h==f\n%d;7h.0h\0f9f!\bh!\ff?d::f0g(ed8h%?fe:ie:g6ed;f,>g-g9d;%e\t\re.\fe(ee8h.>g=.i"e/<e7%d8e\f;i"g\vg\vg;e8ee e93e0eg\'\re"e\n fff0e"d9\veh\fd8f\bfd;\ne94h.:ff\be=e\nh/\tg\t\bd8;d?.f9ed8f\te\r0e?+d9f:f"0h\'g9e-e(g2>g%h7e>e\b)g(g;\'g;-d= d;,h?d9\bf(!e<h/-h(\0h=e$ihf\rd=i#f <d8\0h57g\'e-&d=h2g-d?!f!d;6f2;gh?e\n(d:\'d8d<h..e/<h\b*e\bghge/f/ei!\fg;fd=g(h0f%h3fh*e\n(h4h4#ed8h.?i.e.f=f%eh.(h.:i#d8*e\ri&\be\n e<:e%3f\0\'h\fe4f\re\vd<i2d;\nf%e."f\rh\'\0g\vee\n gh/d8\0g9d?h/e>d9&f\tf\bf5\vh/g\';e\n(f\t\rh=e3e.h!g%(d8\rf-i\0f1d8\re>e\nf3d9\vi4ig(h%i\0f\nh/\tg.f g\b1ffe=1f\td:h$h#=fe-&f:d<f0e-h#d?.h4-g\t)efe(i"g2>ee6e.d:\vff04e93fg$:d8\ne8h0"h0"f.i\0fe8\bd8\nd< g1;e\b+f-\ff2f\v%f\te\bf0i\rd;6e*h&f6d;#h3h(\nh>>e\b0d::gh."ih\0e8\be1g$:e?gh44e-g62g+d8;i!\fh*g6g:\'e\b+g.\0e\rf9i)i#d:f%h/4f\te<\0d;#g e\b i$h/e\b8h\ng.i\rg9f,!f8e$e0h\'e\bh5if\t>e\b0d;%ee$\'e(d8;i!5f\0d=3eg-e$)d8\vd?ig0d;#f#\0f%f\ng%(e0f6f2f\tf-#e88gh3d;#gg.e=e,e<\0e$\re\b6ih\re98g&g\t\bf,e="f\bee$h!\ffee\b0f\0f3f\0f 7e\rh..h.$h/f\0e%=d:\'gf\f\tg\'f\rh#e9?d8e\n(f<+ih4-f0f\t\vg;e>i"f?eh\0f?f2;e.9fe$)e0e\n*e\nd::d;,e\rg:\'i\0e:&d::g\t)h0f4f5h!\fi\0 f\bfe-i)e=h48fe<\0e1g8ih!(g0e=1h\'e&f-$g>e.9e$\'e0f\n%if!f,>e?fh.8e$f3h\'e.6e1d9&e:h?f%g+\ve\r3d8>f\n%f\n\0e7\'e%%h?g;e%d;%f%gh.:d:\vd;6h*g1d8-e\re\ne,e&\be&\bgf-#d8\rie(fe\be\fd;7e\0<e\b+d::gg#e7d=d8g:*e"ie\bd8f\t?f\ve"i?f\td::d?f\fee.6g;4d?.e0f9>e7&e3h!d;=g-f!\be.ig5d?!g;gge=e.#d< d;;e\n!f-#e<g\t9h\t2d8\vf%e\rd<e*h=e=g6i\rf0e\'e.9f\fe/<h?h!\ff%e?h3#e.6h6h?ee0f5f1f/d;f(e:g+i?f-e7f\t\'h!\fe\b6i\0 d9\vd8\0f(e9?g0e:fh?0ee\fd< g;f-\ff\t\vd?i)h/>g(\ve\f;gg;h?h?e;d9\ve\t\rf6e%e94e:&fe?g>d8=f\0i+g;if*f%e\n e7%e\rh4#fg(\vg\t\beh:+d=i\re:e:e.f\bf,e="e<eh1e:e9d8f9i.g.1e\rd:,f1h\fee>h\fd=\rg8d?!i!5i"e\big=i!5g!.e.e>d>\vg=e\0g\'/fih//g.ge.h4f:e3i#i)f\bfgf/e. g\t)i$d:h)h+g>ge\nf6f1h4-g+g9e?g+%f/e$)d8-e$.h.$h/f/d8*e$)f4%e-d=e0g#g;4f\n$f,i!5d8*f\0\'e.f9e88h\'g8f:f\bg%e:e=e>\ve8\bf9d>?f !e-h!e8f\b?e1\vf g.ee7%e/<h4g*g6ie7f,g=g;e\bf!#f!\be\n3e\n(e&e$g>ee<h57f9eg,,ed<h.!h**fig\'e.e.h\'h\ff6\bh49e1e\fe?h.0d=g3;e8&f%e\re-g<h!(e<\0f>e\n gee\b0d:\ff\t\ve$\'if\bd::f0ie1d:+e\f:ee%3e-)ee\bf\t\0e(g;fi\0d?!h6g:\'i\rg=.e=f6d<g\'\0f\0\'ff\b?d:\'i\nf\b2e:e#fd:$e01d8d?e%g(\ve:&ef0d:\vd8f4d8*e11d8ffg\t9f.\ne\bi!fe0\ve1d:i(f\b7h4"e\n!e#0i3e\ne6h4"g;ef\fe92i(f\bg+\ve\b)g\nh\0hf\bi=e\fh#g(f\b6f/h5fff\vee.\ff4gf/g<gd<d<4e(fi"ee\r+gd<f h+e#e,e1h\t/e%=ee\bg,&e\bid;6g\t9g9d8\re/h\v1fh5d:\'f 9f,ff>e/g"<e,d<f0ff4e\n d:+ee\fe-&e/e\n(i\0e\bef%i.g-f,fg>i#g;?h\t2g(3e.g;\bd:gg\t)d>f1fg\ve\nid8%i\rf08h?egf\tig+d:\te/9h1!h49g(d8\re%=g;e/9e\re\bd?h?g9h/e=1i3d<e\n?d8\re0f,#h5e96d8f\tg9f9ee(f0d?!g(h.>f=e="h1!h5f <g*g 4ig\0i\re$\'d:f/f/d8f:h=e\fe7%e.\fg>eeg;d8\0e:g\t\bf\ti\0 g"ef&e5g(d:d?ge g4 d8-e\ve-e(h44e>f\0fi?fe#d;7gh4"e:e0e.\tff-&f1\ti\fi"e\be;:e$)g):i&e\be.\fei)1e\n(d8\vi"d8\re\rh/d?!fd9\ti3e\th\v1e=f<d:.ed:\vg)e.6g>$d<ef0e\r3e/e\rg(1e.6e7e\n(g;f3e\b0f3(fe0e-&f\0\'h=h\0g g!,d;6h\'g\vf8f%fg,i&i i;ii\0g(f1h\vge.d8;g.!i6f.5h(;e\ng?;h/fe\b)ee%=d<<d9i\0h./f=e7%g\v\0f\vd9h.8g/d?e9e;f&e?5e$\'e\vf:g%(gh\'#e\f?e\rcuandoenviarmadridbuscariniciotiempoporquecuentaestadopuedenjuegoscontraestC!nnombretienenperfilmaneraamigosciudadcentroaunquepuedesdentroprimerpreciosegC:nbuenosvolverpuntossemanahabC-aagostonuevosunidoscarlosequiponiC1osmuchosalgunacorreoimagenpartirarribamarC-ahombreempleoverdadcambiomuchasfueronpasadolC-neaparecenuevascursosestabaquierolibroscuantoaccesomiguelvarioscuatrotienesgruposserC!neuropamediosfrenteacercademC!sofertacochesmodeloitalialetrasalgC:ncompracualesexistecuerposiendoprensallegarviajesdineromurciapodrC!puestodiariopuebloquieremanuelpropiocrisisciertoseguromuertefuentecerrargrandeefectopartesmedidapropiaofrecetierrae-mailvariasformasfuturoobjetoseguirriesgonormasmismosC:nicocaminositiosrazC3ndebidopruebatoledotenC-ajesC:sesperococinaorigentiendacientocC!dizhablarserC-alatinafuerzaestiloguerraentrarC)xitolC3pezagendavC-deoevitarpaginametrosjavierpadresfC!cilcabezaC!reassalidaenvC-ojapC3nabusosbienestextosllevarpuedanfuertecomC:nclaseshumanotenidobilbaounidadestC!seditarcreadoP4P;QQQP>P:P0P:P8P;P8Q\rQP>P2QP5P5P3P>P?Q\0P8QP0P:P5Q\tP5QP6P5PP0P:P1P5P7P1Q\vP;P>P=P8PQP5P?P>P4P-QP>QP>P<QP5P<P=P5QP;P5QQ\0P0P7P>P=P0P3P4P5P<P=P5PP;QPQ\0P8P=P0QP=P8QQP5P<P:QP>P3P>P4P2P>QQP0P<P!P(PP<P0QP\'QP>P2P0QP2P0P<P5P<QP"P0P:P4P2P0P=P0P<Q\rQP8Q\rQQPP0P<QP5QP?Q\0P>QQQP=P0P4P4P=QPP>QQQ\0P8P=P5P9PP0QP=P8P<QP0P<QP>QQ\0QP1PP=P8P<P8Q\0P=P5P5PPPP;P8QQ\rQP0PP=P0P=P5P<P4P>P<P<P>P9P4P2P5P>P=P>QQP4`$`%`$9`%\b`$`%\0`$8`%`$`$>`$`%\v`$`$0`$*`$0`$(`%`$`$`$`$?`$-`%\0`$`$8`$`$0`$$`%\v`$9`%\v`$`$*`$9`%\0`$/`$9`$/`$>`$$`$`$%`$>jagran`$`$`$`%\v`$`$,`$&`%\v`$`$\b`$`$>`$`$`$9`$.`$`$(`$5`$9`$/`%`$%`%`$%`%\0`$`$0`$`$,`$&`%\0`$`$\b`$`%\0`$5`%`$(`$\b`$(`$`$9`$0`$\t`$8`$.`%`$`$.`$5`%\v`$2`%`$8`$,`$.`$\b`$&`%`$`$0`$`$.`$,`$8`$-`$0`$,`$(`$`$2`$.`$(`$`$`$8`%\0`$2`%\0X9YY\tX%YY\tYX0X\'X"X.X1X9X/X/X\'YY\tYX0YX5Y\bX1X:Y\nX1YX\'YY\bYX\'X(Y\nYX9X1X6X0YYYYX\'Y\nY\bYYX\'YX9YY\nX\'YX\'YYYX-X*Y\tYX(YY\bX-X)X\'X.X1YYX7X9X(X/X1YYX%X0X\'YYX\'X\'X-X/X%YX\'YY\nYX(X9X6YY\nYX(X-X+Y\bYYY\bYY\bX#YX\'X,X/X\'YYX\'X3YYX9YX/YY\nX3X9X(X1X5YY\tYYX0X(YX\'X#YYYX+YYYX*X\'YX\'X-Y\nX+YX5X1X4X1X-X-Y\bYY\bYY\nX\'X0X\'YYYYX1X)X\'YX*X\'YYX#X(Y\bX.X\'X5X#YX*X\'YYX\'YY\nX9X6Y\bY\bYX/X\'X(YX.Y\nX1X(YX*YYYX4X\'X!Y\bYY\nX\'X(Y\bYX5X5Y\bYX\'X1YYX#X-X/YX-YX9X/YX1X#Y\nX\'X-X)YX*X(X/Y\bYY\nX,X(YYYX*X-X*X,YX)X3YX)Y\nX*YYX1X)X:X2X)YYX3X(Y\nX*YYYYYX\'X*YYYYX(YYX\'X9YYX#Y\bYX4Y\nX!YY\bX1X#YX\'YY\nYX(YYX0X\'X*X1X*X(X(X#YYYX3X\'YYX(Y\nX9YYX/X-X3YYYYX4X9X1X#YYX4YX1YX7X1X7YX(profileservicedefaulthimselfdetailscontentsupportstartedmessagesuccessfashion<title>countryaccountcreatedstoriesresultsrunningprocesswritingobjectsvisiblewelcomearticleunknownnetworkcompanydynamicbrowserprivacyproblemServicerespectdisplayrequestreservewebsitehistoryfriendsoptionsworkingversionmillionchannelwindow.addressvisitedweathercorrectproductedirectforwardyou canremovedsubjectcontrolarchivecurrentreadinglibrarylimitedmanagerfurthersummarymachineminutesprivatecontextprogramsocietynumberswrittenenabledtriggersourcesloadingelementpartnerfinallyperfectmeaningsystemskeepingculture&quot;,journalprojectsurfaces&quot;expiresreviewsbalanceEnglishContentthroughPlease opinioncontactaverageprimaryvillageSpanishgallerydeclinemeetingmissionpopularqualitymeasuregeneralspeciessessionsectionwriterscounterinitialreportsfiguresmembersholdingdisputeearlierexpressdigitalpictureAnothermarriedtrafficleadingchangedcentralvictoryimages/reasonsstudiesfeaturelistingmust beschoolsVersionusuallyepisodeplayinggrowingobviousoverlaypresentactions</ul>\r\nwrapperalreadycertainrealitystorageanotherdesktopofferedpatternunusualDigitalcapitalWebsitefailureconnectreducedAndroiddecadesregular &amp; animalsreleaseAutomatgettingmethodsnothingPopularcaptionletterscapturesciencelicensechangesEngland=1&amp;History = new CentralupdatedSpecialNetworkrequirecommentwarningCollegetoolbarremainsbecauseelectedDeutschfinanceworkersquicklybetweenexactlysettingdiseaseSocietyweaponsexhibit&lt;!--Controlclassescoveredoutlineattacksdevices(windowpurposetitle="Mobile killingshowingItaliandroppedheavilyeffects-1\']);\nconfirmCurrentadvancesharingopeningdrawingbillionorderedGermanyrelated</form>includewhetherdefinedSciencecatalogArticlebuttonslargestuniformjourneysidebarChicagoholidayGeneralpassage,&quot;animatefeelingarrivedpassingnaturalroughly.\n\nThe but notdensityBritainChineselack oftributeIreland" data-factorsreceivethat isLibraryhusbandin factaffairsCharlesradicalbroughtfindinglanding:lang="return leadersplannedpremiumpackageAmericaEdition]&quot;Messageneed tovalue="complexlookingstationbelievesmaller-mobilerecordswant tokind ofFirefoxyou aresimilarstudiedmaximumheadingrapidlyclimatekingdomemergedamountsfoundedpioneerformuladynastyhow to SupportrevenueeconomyResultsbrothersoldierlargelycalling.&quot;AccountEdward segmentRobert effortsPacificlearnedup withheight:we haveAngelesnations_searchappliedacquiremassivegranted: falsetreatedbiggestbenefitdrivingStudiesminimumperhapsmorningsellingis usedreversevariant role="missingachievepromotestudentsomeoneextremerestorebottom:evolvedall thesitemapenglishway to  AugustsymbolsCompanymattersmusicalagainstserving})();\r\npaymenttroubleconceptcompareparentsplayersregionsmonitor \'\'The winningexploreadaptedGalleryproduceabilityenhancecareers). The collectSearch ancientexistedfooter handlerprintedconsoleEasternexportswindowsChannelillegalneutralsuggest_headersigning.html">settledwesterncausing-webkitclaimedJusticechaptervictimsThomas mozillapromisepartieseditionoutside:false,hundredOlympic_buttonauthorsreachedchronicdemandssecondsprotectadoptedprepareneithergreatlygreateroverallimprovecommandspecialsearch.worshipfundingthoughthighestinsteadutilityquarterCulturetestingclearlyexposedBrowserliberal} catchProjectexamplehide();FloridaanswersallowedEmperordefenseseriousfreedomSeveral-buttonFurtherout of != nulltrainedDenmarkvoid(0)/all.jspreventRequestStephen\n\nWhen observe</h2>\r\nModern provide" alt="borders.\n\nFor \n\nMany artistspoweredperformfictiontype ofmedicalticketsopposedCouncilwitnessjusticeGeorge Belgium...</a>twitternotablywaitingwarfare Other rankingphrasesmentionsurvivescholar</p>\r\n Countryignoredloss ofjust asGeorgiastrange<head><stopped1\']);\r\nislandsnotableborder:list ofcarried100,000</h3>\n severalbecomesselect wedding00.htmlmonarchoff theteacherhighly biologylife ofor evenrise of&raquo;plusonehunting(thoughDouglasjoiningcirclesFor theAncientVietnamvehiclesuch ascrystalvalue =Windowsenjoyeda smallassumed<a id="foreign All rihow theDisplayretiredhoweverhidden;battlesseekingcabinetwas notlook atconductget theJanuaryhappensturninga:hoverOnline French lackingtypicalextractenemieseven ifgeneratdecidedare not/searchbeliefs-image:locatedstatic.login">convertviolententeredfirst">circuitFinlandchemistshe was10px;">as suchdivided</span>will beline ofa greatmystery/index.fallingdue to railwaycollegemonsterdescentit withnuclearJewish protestBritishflowerspredictreformsbutton who waslectureinstantsuicidegenericperiodsmarketsSocial fishingcombinegraphicwinners<br /><by the NaturalPrivacycookiesoutcomeresolveSwedishbrieflyPersianso muchCenturydepictscolumnshousingscriptsnext tobearingmappingrevisedjQuery(-width:title">tooltipSectiondesignsTurkishyounger.match(})();\n\nburningoperatedegreessource=Richardcloselyplasticentries</tr>\r\ncolor:#ul id="possessrollingphysicsfailingexecutecontestlink toDefault<br />\n: true,chartertourismclassicproceedexplain</h1>\r\nonline.?xml vehelpingdiamonduse theairlineend --\x3e).attr(readershosting#ffffffrealizeVincentsignals src="/ProductdespitediversetellingPublic held inJoseph theatreaffects<style>a largedoesn\'tlater, ElementfaviconcreatorHungaryAirportsee theso thatMichaelSystemsPrograms, and  width=e&quot;tradingleft">\npersonsGolden Affairsgrammarformingdestroyidea ofcase ofoldest this is.src = cartoonregistrCommonsMuslimsWhat isin manymarkingrevealsIndeed,equally/show_aoutdoorescape(Austriageneticsystem,In the sittingHe alsoIslandsAcademy\n\t\t\x3c!--Daniel bindingblock">imposedutilizeAbraham(except{width:putting).html(|| [];\nDATA[ *kitchenmountedactual dialectmainly _blank\'installexpertsif(typeIt also&copy; ">Termsborn inOptionseasterntalkingconcerngained ongoingjustifycriticsfactoryits ownassaultinvitedlastinghis ownhref="/" rel="developconcertdiagramdollarsclusterphp?id=alcohol);})();using a><span>vesselsrevivalAddressamateurandroidallegedillnesswalkingcentersqualifymatchesunifiedextinctDefensedied in\n\t\x3c!-- customslinkingLittle Book ofeveningmin.js?are thekontakttoday\'s.html" target=wearingAll Rig;\n})();raising Also, crucialabout">declare--\x3e\n<scfirefoxas muchappliesindex, s, but type = \n\r\n\x3c!--towardsRecordsPrivateForeignPremierchoicesVirtualreturnsCommentPoweredinline;povertychamberLiving volumesAnthonylogin" RelatedEconomyreachescuttinggravitylife inChapter-shadowNotable</td>\r\n returnstadiumwidgetsvaryingtravelsheld bywho arework infacultyangularwho hadairporttown of\n\nSome \'click\'chargeskeywordit willcity of(this);Andrew unique checkedor more300px; return;rsion="pluginswithin herselfStationFederalventurepublishsent totensionactresscome tofingersDuke ofpeople,exploitwhat isharmonya major":"httpin his menu">\nmonthlyofficercouncilgainingeven inSummarydate ofloyaltyfitnessand wasemperorsupremeSecond hearingRussianlongestAlbertalateralset of small">.appenddo withfederalbank ofbeneathDespiteCapitalgrounds), and percentit fromclosingcontainInsteadfifteenas well.yahoo.respondfighterobscurereflectorganic= Math.editingonline paddinga wholeonerroryear ofend of barrierwhen itheader home ofresumedrenamedstrong>heatingretainscloudfrway of March 1knowingin partBetweenlessonsclosestvirtuallinks">crossedEND --\x3efamous awardedLicenseHealth fairly wealthyminimalAfricancompetelabel">singingfarmersBrasil)discussreplaceGregoryfont copursuedappearsmake uproundedboth ofblockedsaw theofficescoloursif(docuwhen heenforcepush(fuAugust UTF-8">Fantasyin mostinjuredUsuallyfarmingclosureobject defenceuse of Medical<body>\nevidentbe usedkeyCodesixteenIslamic#000000entire widely active (typeofone cancolor =speakerextendsPhysicsterrain<tbody>funeralviewingmiddle cricketprophetshifteddoctorsRussell targetcompactalgebrasocial-bulk ofman and</td>\n he left).val()false);logicalbankinghome tonaming Arizonacredits);\n});\nfounderin turnCollinsbefore But thechargedTitle">CaptainspelledgoddessTag --\x3eAdding:but wasRecent patientback in=false&Lincolnwe knowCounterJudaismscript altered\']);\n  has theunclearEvent\',both innot all\n\n\x3c!-- placinghard to centersort ofclientsstreetsBernardassertstend tofantasydown inharbourFreedomjewelry/about..searchlegendsis mademodern only ononly toimage" linear painterand notrarely acronymdelivershorter00&amp;as manywidth="/* <![Ctitle =of the lowest picked escapeduses ofpeoples PublicMatthewtacticsdamagedway forlaws ofeasy to windowstrong  simple}catch(seventhinfoboxwent topaintedcitizenI don\'tretreat. Some ww.");\nbombingmailto:made in. Many carries||{};wiwork ofsynonymdefeatsfavoredopticalpageTraunless sendingleft"><comScorAll thejQuery.touristClassicfalse" Wilhelmsuburbsgenuinebishops.split(global followsbody ofnominalContactsecularleft tochiefly-hidden-banner</li>\n\n. When in bothdismissExplorealways via thespaC1olwelfareruling arrangecaptainhis sonrule ofhe tookitself,=0&amp;(calledsamplesto makecom/pagMartin Kennedyacceptsfull ofhandledBesides//--\x3e</able totargetsessencehim to its by common.mineralto takeways tos.org/ladvisedpenaltysimple:if theyLettersa shortHerbertstrikes groups.lengthflightsoverlapslowly lesser social </p>\n\t\tit intoranked rate oful>\r\n  attemptpair ofmake itKontaktAntoniohaving ratings activestreamstrapped").css(hostilelead tolittle groups,Picture--\x3e\r\n\r\n rows=" objectinverse<footerCustomV><\\/scrsolvingChamberslaverywoundedwhereas!= \'undfor allpartly -right:Arabianbacked centuryunit ofmobile-Europe,is homerisk ofdesiredClintoncost ofage of become none ofp&quot;Middle ead\')[0Criticsstudios>&copy;group">assemblmaking pressedwidget.ps:" ? rebuiltby someFormer editorsdelayedCanonichad thepushingclass="but arepartialBabylonbottom carrierCommandits useAs withcoursesa thirddenotesalso inHouston20px;">accuseddouble goal ofFamous ).bind(priests Onlinein Julyst + "gconsultdecimalhelpfulrevivedis veryr\'+\'iptlosing femalesis alsostringsdays ofarrivalfuture <objectforcingString(" />\n\t\there isencoded.  The balloondone by/commonbgcolorlaw of Indianaavoidedbut the2px 3pxjquery.after apolicy.men andfooter-= true;for usescreen.Indian image =family,http:// &nbsp;driverseternalsame asnoticedviewers})();\n is moreseasonsformer the newis justconsent Searchwas thewhy theshippedbr><br>width: height=made ofcuisineis thata very Admiral fixed;normal MissionPress, ontariocharsettry to invaded="true"spacingis mosta more totallyfall of});\r\n  immensetime inset outsatisfyto finddown tolot of Playersin Junequantumnot thetime todistantFinnishsrc = (single help ofGerman law andlabeledforestscookingspace">header-well asStanleybridges/globalCroatia About [0];\n  it, andgroupedbeing a){throwhe madelighterethicalFFFFFF"bottom"like a employslive inas seenprintermost ofub-linkrejectsand useimage">succeedfeedingNuclearinformato helpWomen\'sNeitherMexicanprotein<table by manyhealthylawsuitdevised.push({sellerssimply Through.cookie Image(older">us.js"> Since universlarger open to!-- endlies in\']);\r\n  marketwho is ("DOMComanagedone fortypeof Kingdomprofitsproposeto showcenter;made itdressedwere inmixtureprecisearisingsrc = \'make a securedBaptistvoting \n\t\tvar March 2grew upClimate.removeskilledway the</head>face ofacting right">to workreduceshas haderectedshow();action=book ofan area== "htt<header\n<html>conformfacing cookie.rely onhosted .customhe wentbut forspread Family a meansout theforums.footage">MobilClements" id="as highintense--\x3e\x3c!--female is seenimpliedset thea stateand hisfastestbesidesbutton_bounded"><img Infoboxevents,a youngand areNative cheaperTimeoutand hasengineswon the(mostlyright: find a -bottomPrince area ofmore ofsearch_nature,legallyperiod,land ofor withinducedprovingmissilelocallyAgainstthe wayk&quot;px;">\r\npushed abandonnumeralCertainIn thismore inor somename isand, incrownedISBN 0-createsOctobermay notcenter late inDefenceenactedwish tobroadlycoolingonload=it. TherecoverMembersheight assumes<html>\npeople.in one =windowfooter_a good reklamaothers,to this_cookiepanel">London,definescrushedbaptismcoastalstatus title" move tolost inbetter impliesrivalryservers SystemPerhapses and contendflowinglasted rise inGenesisview ofrising seem tobut in backinghe willgiven agiving cities.flow of Later all butHighwayonly bysign ofhe doesdiffersbattery&amp;lasinglesthreatsintegertake onrefusedcalled =US&ampSee thenativesby thissystem.head of:hover,lesbiansurnameand allcommon/header__paramsHarvard/pixel.removalso longrole ofjointlyskyscraUnicodebr />\r\nAtlantanucleusCounty,purely count">easily build aonclicka givenpointerh&quot;events else {\nditionsnow the, with man whoorg/Webone andcavalryHe diedseattle00,000 {windowhave toif(windand itssolely m&quot;renewedDetroitamongsteither them inSenatorUs</a><King ofFrancis-produche usedart andhim andused byscoringat hometo haverelatesibilityfactionBuffalolink"><what hefree toCity ofcome insectorscountedone daynervoussquare };if(goin whatimg" alis onlysearch/tuesdaylooselySolomonsexual - <a hrmedium"DO NOT France,with a war andsecond take a >\r\n\r\n\r\nmarket.highwaydone inctivity"last">obligedrise to"undefimade to Early praisedin its for hisathleteJupiterYahoo! termed so manyreally s. The a woman?value=direct right" bicycleacing="day andstatingRather,higher Office are nowtimes, when a pay foron this-link">;borderaround annual the Newput the.com" takin toa brief(in thegroups.; widthenzymessimple in late{returntherapya pointbanninginks">\n();" rea place\\u003Caabout atr>\r\n\t\tccount gives a<SCRIPTRailwaythemes/toolboxById("xhumans,watchesin some if (wicoming formats Under but hashanded made bythan infear ofdenoted/iframeleft involtagein eacha&quot;base ofIn manyundergoregimesaction </p>\r\n<ustomVa;&gt;</importsor thatmostly &amp;re size="</a></ha classpassiveHost = WhetherfertileVarious=[];(fucameras/></td>acts asIn some>\r\n\r\n<!organis <br />BeijingcatalC deutscheuropeueuskaragaeilgesvenskaespaC1amensajeusuariotrabajomC)xicopC!ginasiempresistemaoctubreduranteaC1adirempresamomentonuestroprimeratravC)sgraciasnuestraprocesoestadoscalidadpersonanC:meroacuerdomC:sicamiembroofertasalgunospaC-sesejemploderechoademC!sprivadoagregarenlacesposiblehotelessevillaprimeroC:ltimoeventosarchivoculturamujeresentradaanuncioembargomercadograndesestudiomejoresfebrerodiseC1oturismocC3digoportadaespaciofamiliaantoniopermiteguardaralgunaspreciosalguiensentidovisitastC-tuloconocersegundoconsejofranciaminutossegundatenemosefectosmC!lagasesiC3nrevistagranadacompraringresogarcC-aacciC3necuadorquienesinclusodeberC!materiahombresmuestrapodrC-amaC1anaC:ltimaestamosoficialtambienningC:nsaludospodemosmejorarpositionbusinesshomepagesecuritylanguagestandardcampaignfeaturescategoryexternalchildrenreservedresearchexchangefavoritetemplatemilitaryindustryservicesmaterialproductsz-index:commentssoftwarecompletecalendarplatformarticlesrequiredmovementquestionbuildingpoliticspossiblereligionphysicalfeedbackregisterpicturesdisabledprotocolaudiencesettingsactivityelementslearninganythingabstractprogressoverviewmagazineeconomictrainingpressurevarious <strong>propertyshoppingtogetheradvancedbehaviordownloadfeaturedfootballselectedLanguagedistanceremembertrackingpasswordmodifiedstudentsdirectlyfightingnortherndatabasefestivalbreakinglocationinternetdropdownpracticeevidencefunctionmarriageresponseproblemsnegativeprogramsanalysisreleasedbanner">purchasepoliciesregionalcreativeargumentbookmarkreferrerchemicaldivisioncallbackseparateprojectsconflicthardwareinterestdeliverymountainobtained= false;for(var acceptedcapacitycomputeridentityaircraftemployedproposeddomesticincludesprovidedhospitalverticalcollapseapproachpartnerslogo"><adaughterauthor" culturalfamilies/images/assemblypowerfulteachingfinisheddistrictcriticalcgi-bin/purposesrequireselectionbecomingprovidesacademicexerciseactuallymedicineconstantaccidentMagazinedocumentstartingbottom">observed: &quot;extendedpreviousSoftwarecustomerdecisionstrengthdetailedslightlyplanningtextareacurrencyeveryonestraighttransferpositiveproducedheritageshippingabsolutereceivedrelevantbutton" violenceanywherebenefitslaunchedrecentlyalliancefollowedmultiplebulletinincludedoccurredinternal$(this).republic><tr><tdcongressrecordedultimatesolution<ul id="discoverHome</a>websitesnetworksalthoughentirelymemorialmessagescontinueactive">somewhatvictoriaWestern  title="LocationcontractvisitorsDownloadwithout right">\nmeasureswidth = variableinvolvedvirginianormallyhappenedaccountsstandingnationalRegisterpreparedcontrolsaccuratebirthdaystrategyofficialgraphicscriminalpossiblyconsumerPersonalspeakingvalidateachieved.jpg" />machines</h2>\n  keywordsfriendlybrotherscombinedoriginalcomposedexpectedadequatepakistanfollow" valuable</label>relativebringingincreasegovernorplugins/List of Header">" name=" (&quot;graduate</head>\ncommercemalaysiadirectormaintain;height:schedulechangingback to catholicpatternscolor: #greatestsuppliesreliable</ul>\n\t\t<select citizensclothingwatching<li id="specificcarryingsentence<center>contrastthinkingcatch(e)southernMichael merchantcarouselpadding:interior.split("lizationOctober ){returnimproved--&gt;\n\ncoveragechairman.png" />subjectsRichard whateverprobablyrecoverybaseballjudgmentconnect..css" /> websitereporteddefault"/></a>\r\nelectricscotlandcreationquantity. ISBN 0did not instance-search-" lang="speakersComputercontainsarchivesministerreactiondiscountItalianocriteriastrongly: \'http:\'script\'coveringofferingappearedBritish identifyFacebooknumerousvehiclesconcernsAmericanhandlingdiv id="William provider_contentaccuracysection andersonflexibleCategorylawrence<script>layout="approved maximumheader"></table>Serviceshamiltoncurrent canadianchannels/themes//articleoptionalportugalvalue=""intervalwirelessentitledagenciesSearch" measuredthousandspending&hellip;new Date" size="pageNamemiddle" " /></a>hidden">sequencepersonaloverflowopinionsillinoislinks">\n\t<title>versionssaturdayterminalitempropengineersectionsdesignerproposal="false"EspaC1olreleasessubmit" er&quot;additionsymptomsorientedresourceright"><pleasurestationshistory.leaving  border=contentscenter">.\n\nSome directedsuitablebulgaria.show();designedGeneral conceptsExampleswilliamsOriginal"><span>search">operatorrequestsa &quot;allowingDocumentrevision. \n\nThe yourselfContact michiganEnglish columbiapriorityprintingdrinkingfacilityreturnedContent officersRussian generate-8859-1"indicatefamiliar qualitymargin:0 contentviewportcontacts-title">portable.length eligibleinvolvesatlanticonload="default.suppliedpaymentsglossary\n\nAfter guidance</td><tdencodingmiddle">came to displaysscottishjonathanmajoritywidgets.clinicalthailandteachers<head>\n\taffectedsupportspointer;toString</small>oklahomawill be investor0" alt="holidaysResourcelicensed (which . After considervisitingexplorerprimary search" android"quickly meetingsestimate;return ;color:# height=approval, &quot; checked.min.js"magnetic></a></hforecast. While thursdaydvertise&eacute;hasClassevaluateorderingexistingpatients Online coloradoOptions"campbell\x3c!-- end</span><<br />\r\n_popups|sciences,&quot; quality Windows assignedheight: <b classle&quot; value=" Companyexamples<iframe believespresentsmarshallpart of properly).\n\nThe taxonomymuch of </span>\n" data-srtuguC*sscrollTo project<head>\r\nattorneyemphasissponsorsfancyboxworld\'s wildlifechecked=sessionsprogrammpx;font- Projectjournalsbelievedvacationthompsonlightingand the special border=0checking</tbody><button Completeclearfix\n<head>\narticle <sectionfindingsrole in popular  Octoberwebsite exposureused to  changesoperatedclickingenteringcommandsinformed numbers  </div>creatingonSubmitmarylandcollegesanalyticlistingscontact.loggedInadvisorysiblingscontent"s&quot;)s. This packagescheckboxsuggestspregnanttomorrowspacing=icon.pngjapanesecodebasebutton">gamblingsuch as , while </span> missourisportingtop:1px .</span>tensionswidth="2lazyloadnovemberused in height="cript">\n&nbsp;</<tr><td height:2/productcountry include footer" &lt;!-- title"></jquery.</form>\n(g.\0d=)(g9i+)hrvatskiitalianoromC"nDtC<rkC\'eX\'X1X/Y\btambiC)nnoticiasmensajespersonasderechosnacionalserviciocontactousuariosprogramagobiernoempresasanunciosvalenciacolombiadespuC)sdeportesproyectoproductopC:bliconosotroshistoriapresentemillonesmediantepreguntaanteriorrecursosproblemasantiagonuestrosopiniC3nimprimirmientrasamC)ricavendedorsociedadrespectorealizarregistropalabrasinterC)sentoncesespecialmiembrosrealidadcC3rdobazaragozapC!ginassocialesbloqueargestiC3nalquilersistemascienciascompletoversiC3ncompletaestudiospC:blicaobjetivoalicantebuscadorcantidadentradasaccionesarchivossuperiormayorC-aalemaniafunciC3nC:ltimoshaciendoaquellosediciC3nfernandoambientefacebooknuestrasclientesprocesosbastantepresentareportarcongresopublicarcomerciocontratojC3venesdistritotC)cnicaconjuntoenergC-atrabajarasturiasrecienteutilizarboletC-nsalvadorcorrectatrabajosprimerosnegocioslibertaddetallespantallaprC3ximoalmerC-aanimalesquiC)nescorazC3nsecciC3nbuscandoopcionesexteriorconceptotodavC-agalerC-aescribirmedicinalicenciaconsultaaspectoscrC-ticadC3laresjusticiadeberC!nperC-odonecesitamantenerpequeC1orecibidatribunaltenerifecanciC3ncanariasdescargadiversosmallorcarequieretC)cnicodeberC-aviviendafinanzasadelantefuncionaconsejosdifC-cilciudadesantiguasavanzadatC)rminounidadessC!nchezcampaC1asoftonicrevistascontienesectoresmomentosfacultadcrC)ditodiversassupuestofactoressegundospequeC1aP3P>P4P0P5QP;P8P5QQQ\fP1Q\vP;P>P1Q\vQQ\fQ\rQP>P<PQP;P8QP>P3P>P<P5P=QP2QP5QQ\rQP>P9P4P0P6P5P1Q\vP;P8P3P>P4QP4P5P=Q\fQ\rQP>QP1Q\vP;P0QP5P1QP>P4P8P=QP5P1P5P=P0P4P>QP0P9QQP>QP>P=P5P3P>QP2P>P8QP2P>P9P8P3Q\0Q\vQP>P6P5P2QP5P<QP2P>QP;P8Q\bQ\fQ\rQP8QP?P>P:P0P4P=P5P9P4P>P<P0P<P8Q\0P0P;P8P1P>QP5P<QQP>QQP4P2QQQP5QP8P;QP4P8P4P5P;P>P<P8Q\0P5QP5P1QQP2P>P5P2P8P4P5QP5P3P>Q\rQP8P<QQP5QQP5P<Q\vQP5P=Q\vQQP0P;P2P5P4Q\fQP5P<P5P2P>P4Q\vQP5P1P5P2Q\vQ\bP5P=P0P<P8QP8P?P0QP>P<QP?Q\0P0P2P;P8QP0P>P4P=P0P3P>P4Q\vP7P=P0QP<P>P3QP4Q\0QP3P2QP5P9P8P4P5QP:P8P=P>P>P4P=P>P4P5P;P0P4P5P;P5QQ\0P>P:P8QP=QP2P5QQ\fPQQQ\fQ\0P0P7P0P=P0Q\bP8X\'YYYX\'YX*Y\nX,YY\nX9X.X\'X5X)X\'YX0Y\nX9YY\nYX,X/Y\nX/X\'YX"YX\'YX1X/X*X-YYX5YX-X)YX\'YX*X\'YYY\nY\nYY\bYX4X(YX)YY\nYX\'X(YX\'X*X-Y\bX\'X!X#YX+X1X.YX\'YX\'YX-X(X/YY\nYX/X1Y\bX3X\'X6X:X7X*YY\bYYYX\'YX3X\'X-X)YX\'X/Y\nX\'YX7X(X9YY\nYX4YX1X\'Y\nYYYYYYX\'X4X1YX)X1X&Y\nX3YX4Y\nX7YX\'X0X\'X\'YYYX4X(X\'X(X*X9X(X1X1X-YX)YX\'YX)Y\nYY\bYYX1YX2YYYX)X#X-YX/YYX(Y\nY\nX9YY\nX5Y\bX1X)X7X1Y\nYX4X\'X1YX,Y\bX\'YX#X.X1Y\tYX9YX\'X\'X(X-X+X9X1Y\bX6X(X4YYYX3X,YX(YX\'YX.X\'YX/YX*X\'X(YYY\nX)X(X/Y\bYX#Y\nX6X\'Y\nY\bX,X/YX1Y\nYYX*X(X*X#YX6YYX7X(X.X\'YX+X1X(X\'X1YX\'YX6YX\'X-YY\tYYX3YX#Y\nX\'YX1X/Y\bX/X#YYX\'X/Y\nYX\'X\'YX\'YYX9X1X6X*X9YYX/X\'X.YYYYY\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\b\t\n\v\f\r\r\f\v\n\t\b\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\b\0\b\0\b\0\b\0\0\0\0\0\0\0\0\0resourcescountriesquestionsequipmentcommunityavailablehighlightDTD/xhtmlmarketingknowledgesomethingcontainerdirectionsubscribeadvertisecharacter" value="</select>Australia" class="situationauthorityfollowingprimarilyoperationchallengedevelopedanonymousfunction functionscompaniesstructureagreement" title="potentialeducationargumentssecondarycopyrightlanguagesexclusivecondition</form>\r\nstatementattentionBiography} else {\nsolutionswhen the Analyticstemplatesdangeroussatellitedocumentspublisherimportantprototypeinfluence&raquo;</effectivegenerallytransformbeautifultransportorganizedpublishedprominentuntil thethumbnailNational .focus();over the migrationannouncedfooter">\nexceptionless thanexpensiveformationframeworkterritoryndicationcurrentlyclassNamecriticismtraditionelsewhereAlexanderappointedmaterialsbroadcastmentionedaffiliate</option>treatmentdifferent/default.Presidentonclick="biographyotherwisepermanentFranC\'aisHollywoodexpansionstandards</style>\nreductionDecember preferredCambridgeopponentsBusiness confusion>\n<title>presentedexplaineddoes not worldwideinterfacepositionsnewspaper</table>\nmountainslike the essentialfinancialselectionaction="/abandonedEducationparseInt(stabilityunable to</title>\nrelationsNote thatefficientperformedtwo yearsSince thethereforewrapper">alternateincreasedBattle ofperceivedtrying tonecessaryportrayedelectionsElizabeth</iframe>discoveryinsurances.length;legendaryGeographycandidatecorporatesometimesservices.inherited</strong>CommunityreligiouslocationsCommitteebuildingsthe worldno longerbeginningreferencecannot befrequencytypicallyinto the relative;recordingpresidentinitiallytechniquethe otherit can beexistenceunderlinethis timetelephoneitemscopepracticesadvantage);return For otherprovidingdemocracyboth the extensivesufferingsupportedcomputers functionpracticalsaid thatit may beEnglish</from the scheduleddownloads</label>\nsuspectedmargin: 0spiritual</head>\n\nmicrosoftgraduallydiscussedhe becameexecutivejquery.jshouseholdconfirmedpurchasedliterallydestroyedup to thevariationremainingit is notcenturiesJapanese among thecompletedalgorithminterestsrebellionundefinedencourageresizableinvolvingsensitiveuniversalprovision(althoughfeaturingconducted), which continued-header">February numerous overflow:componentfragmentsexcellentcolspan="technicalnear the Advanced source ofexpressedHong Kong Facebookmultiple mechanismelevationoffensive</form>\n\tsponsoreddocument.or &quot;there arethose whomovementsprocessesdifficultsubmittedrecommendconvincedpromoting" width=".replace(classicalcoalitionhis firstdecisionsassistantindicatedevolution-wrapper"enough toalong thedelivered--\x3e\r\n\x3c!--American protectedNovember </style><furnitureInternet  onblur="suspendedrecipientbased on Moreover,abolishedcollectedwere madeemotionalemergencynarrativeadvocatespx;bordercommitteddir="ltr"employeesresearch. selectedsuccessorcustomersdisplayedSeptemberaddClass(Facebook suggestedand lateroperatingelaborateSometimesInstitutecertainlyinstalledfollowersJerusalemthey havecomputinggeneratedprovincesguaranteearbitraryrecognizewanted topx;width:theory ofbehaviourWhile theestimatedbegan to it becamemagnitudemust havemore thanDirectoryextensionsecretarynaturallyoccurringvariablesgiven theplatform.</label><failed tocompoundskinds of societiesalongside --&gt;\n\nsouthwestthe rightradiationmay have unescape(spoken in" href="/programmeonly the come fromdirectoryburied ina similarthey were</font></Norwegianspecifiedproducingpassenger(new DatetemporaryfictionalAfter theequationsdownload.regularlydeveloperabove thelinked tophenomenaperiod oftooltip">substanceautomaticaspect ofAmong theconnectedestimatesAir Forcesystem ofobjectiveimmediatemaking itpaintingsconqueredare stillproceduregrowth ofheaded byEuropean divisionsmoleculesfranchiseintentionattractedchildhoodalso useddedicatedsingaporedegree offather ofconflicts</a></p>\ncame fromwere usednote thatreceivingExecutiveeven moreaccess tocommanderPoliticalmusiciansdeliciousprisonersadvent ofUTF-8" /><![CDATA[">ContactSouthern bgcolor="series of. It was in Europepermittedvalidate.appearingofficialsseriously-languageinitiatedextendinglong-terminflationsuch thatgetCookiemarked by</button>implementbut it isincreasesdown the requiringdependent--\x3e\n\x3c!-- interviewWith the copies ofconsensuswas builtVenezuela(formerlythe statepersonnelstrategicfavour ofinventionWikipediacontinentvirtuallywhich wasprincipleComplete identicalshow thatprimitiveaway frommolecularpreciselydissolvedUnder theversion=">&nbsp;</It is the This is will haveorganismssome timeFriedrichwas firstthe only fact thatform id="precedingTechnicalphysicistoccurs innavigatorsection">span id="sought tobelow thesurviving}</style>his deathas in thecaused bypartiallyexisting using thewas givena list oflevels ofnotion ofOfficial dismissedscientistresemblesduplicateexplosiverecoveredall othergalleries{padding:people ofregion ofaddressesassociateimg alt="in modernshould bemethod ofreportingtimestampneeded tothe Greatregardingseemed toviewed asimpact onidea thatthe Worldheight ofexpandingThese arecurrent">carefullymaintainscharge ofClassicaladdressedpredictedownership<div id="right">\r\nresidenceleave thecontent">are often  })();\r\nprobably Professor-button" respondedsays thathad to beplaced inHungarianstatus ofserves asUniversalexecutionaggregatefor whichinfectionagreed tohowever, popular">placed onconstructelectoralsymbol ofincludingreturn toarchitectChristianprevious living ineasier toprofessor\n&lt;!-- effect ofanalyticswas takenwhere thetook overbelief inAfrikaansas far aspreventedwork witha special<fieldsetChristmasRetrieved\n\nIn the back intonortheastmagazines><strong>committeegoverninggroups ofstored inestablisha generalits firsttheir ownpopulatedan objectCaribbeanallow thedistrictswisconsinlocation.; width: inhabitedSocialistJanuary 1</footer>similarlychoice ofthe same specific business The first.length; desire todeal withsince theuserAgentconceivedindex.phpas &quot;engage inrecently,few yearswere also\n<head>\n<edited byare knowncities inaccesskeycondemnedalso haveservices,family ofSchool ofconvertednature of languageministers</object>there is a popularsequencesadvocatedThey wereany otherlocation=enter themuch morereflectedwas namedoriginal a typicalwhen theyengineerscould notresidentswednesdaythe third productsJanuary 2what theya certainreactionsprocessorafter histhe last contained"></div>\n</a></td>depend onsearch">\npieces ofcompetingReferencetennesseewhich has version=</span> <</header>gives thehistorianvalue="">padding:0view thattogether,the most was foundsubset ofattack onchildren,points ofpersonal position:allegedlyClevelandwas laterand afterare givenwas stillscrollingdesign ofmakes themuch lessAmericans.\n\nAfter , but theMuseum oflouisiana(from theminnesotaparticlesa processDominicanvolume ofreturningdefensive00px|righmade frommouseover" style="states of(which iscontinuesFranciscobuilding without awith somewho woulda form ofa part ofbefore itknown as  Serviceslocation and oftenmeasuringand it ispaperbackvalues of\r\n<title>= window.determineer&quot; played byand early</center>from thisthe threepower andof &quot;innerHTML<a href="y:inline;Church ofthe eventvery highofficial -height: content="/cgi-bin/to createafrikaansesperantofranC\'aislatvieE!ulietuviE3D\feE!tinaD\reE!tina`9`8`8"f%f,h*g.\0d=e-g9i+e-mj5-l4d8:d;\0d9\bh.!g.f:g,h.0f,h(h+e\r\0f\re\n!e(d:hg=f\b?e0d:\'d?1d9i(e:g\t\bg$>fh!\ff&i(h=f <h?d8\0f-%f/d;e.i*\fh/g e\'ed<f0f\r.e:f6\bh49h\0e\ne,e.$h.(h.:e\f:f71e3e8f-f>e(e\fd:,e8e$\'e-&gh6\nf%h6\ng.!ged?!f/g=serviciosartC-culoargentinabarcelonacualquierpublicadoproductospolC-ticarespuestawikipediasiguientebC:squedacomunidadseguridadprincipalpreguntascontenidorespondervenezuelaproblemasdiciembrerelaciC3nnoviembresimilaresproyectosprogramasinstitutoactividadencuentraeconomC-aimC!genescontactardescargarnecesarioatenciC3ntelC)fonocomisiC3ncancionescapacidadencontraranC!lisisfavoritostC)rminosprovinciaetiquetaselementosfuncionesresultadocarC!cterpropiedadprincipionecesidadmunicipalcreaciC3ndescargaspresenciacomercialopinionesejercicioeditorialsalamancagonzC!lezdocumentopelC-cularecientesgeneralestarragonaprC!cticanovedadespropuestapacientestC)cnicasobjetivoscontactos`$.`%`$`$2`$?`$`$9`%\b`$`$`$/`$>`$8`$>`$%`$`$5`$`$0`$9`%`$`%\v`$\b`$`%`$`$0`$9`$>`$,`$>`$&`$`$9`$>`$8`$-`%\0`$9`%`$`$0`$9`%\0`$.`%\b`$`$&`$?`$(`$,`$>`$$diplodocs`$8`$.`$/`$0`%`$*`$(`$>`$.`$*`$$`$>`$+`$?`$0`$`$8`$$`$$`$0`$9`$2`%\v`$`$9`%`$`$,`$>`$0`$&`%`$6`$9`%`$\b`$`%`$2`$/`$&`$?`$`$>`$.`$5`%`$,`$$`%\0`$(`$,`%\0`$`$.`%\f`$$`$8`$>`$2`$2`%`$`$`%\t`$,`$.`$&`$&`$$`$%`$>`$(`$9`%\0`$6`$9`$0`$`$2`$`$`$-`%\0`$(`$`$0`$*`$>`$8`$0`$>`$$`$`$?`$`$\t`$8`%`$`$/`%\0`$9`%`$`$`$`%`$`%\0`$.`$`%\v`$`$`$>`$0`$`$-`%\0`$`$/`%`$$`%`$.`$5`%\v`$`$&`%`$`$`$`$0`$`$8`%`$.`%`$2`$2`$`$>`$9`$>`$2`$\n`$*`$0`$`$>`$0`$`$8`$>`$&`%`$0`$`$?`$8`$&`$?`$2`$,`$`$&`$,`$(`$>`$9`%`$`$2`$>`$`$`%\0`$$`$,`$`$(`$.`$?`$2`$`$8`%`$`$(`%`$(`$/`$>`$`%`$2`$2`%\t`$`$-`$>`$`$0`%`$2`$`$`$9`$0`$>`$.`$2`$`%`$*`%`$`$9`$>`$%`$`$8`%\0`$8`$9`%\0`$`$2`$>`$ `%\0`$`$9`$>`$`$&`%`$0`$$`$9`$$`$8`$>`$$`$/`$>`$&`$`$/`$>`$*`$>`$`$`%\f`$(`$6`$>`$.`$&`%`$`$/`$9`%\0`$0`$>`$/`$`%`$&`$2`$`%\0categoriesexperience</title>\r\nCopyright javascriptconditionseverything<p class="technologybackground<a class="management&copy; 201javaScriptcharactersbreadcrumbthemselveshorizontalgovernmentCaliforniaactivitiesdiscoveredNavigationtransitionconnectionnavigationappearance</title><mcheckbox" techniquesprotectionapparentlyas well asunt\', \'UA-resolutionoperationstelevisiontranslatedWashingtonnavigator. = window.impression&lt;br&gt;literaturepopulationbgcolor="#especially content="productionnewsletterpropertiesdefinitionleadershipTechnologyParliamentcomparisonul class=".indexOf("conclusiondiscussioncomponentsbiologicalRevolution_containerunderstoodnoscript><permissioneach otheratmosphere onfocus="<form id="processingthis.valuegenerationConferencesubsequentwell-knownvariationsreputationphenomenondisciplinelogo.png" (document,boundariesexpressionsettlementBackgroundout of theenterprise("https:" unescape("password" democratic<a href="/wrapper">\nmembershiplinguisticpx;paddingphilosophyassistanceuniversityfacilitiesrecognizedpreferenceif (typeofmaintainedvocabularyhypothesis.submit();&amp;nbsp;annotationbehind theFoundationpublisher"assumptionintroducedcorruptionscientistsexplicitlyinstead ofdimensions onClick="considereddepartmentoccupationsoon afterinvestmentpronouncedidentifiedexperimentManagementgeographic" height="link rel=".replace(/depressionconferencepunishmenteliminatedresistanceadaptationoppositionwell knownsupplementdeterminedh1 class="0px;marginmechanicalstatisticscelebratedGovernment\n\nDuring tdevelopersartificialequivalentoriginatedCommissionattachment<span id="there wereNederlandsbeyond theregisteredjournalistfrequentlyall of thelang="en" </style>\r\nabsolute; supportingextremely mainstream</strong> popularityemployment</table>\r\n colspan="</form>\n  conversionabout the </p></div>integrated" lang="enPortuguesesubstituteindividualimpossiblemultimediaalmost allpx solid #apart fromsubject toin Englishcriticizedexcept forguidelinesoriginallyremarkablethe secondh2 class="<a title="(includingparametersprohibited= "http://dictionaryperceptionrevolutionfoundationpx;height:successfulsupportersmillenniumhis fatherthe &quot;no-repeat;commercialindustrialencouragedamount of unofficialefficiencyReferencescoordinatedisclaimerexpeditiondevelopingcalculatedsimplifiedlegitimatesubstring(0" class="completelyillustratefive yearsinstrumentPublishing1" class="psychologyconfidencenumber of absence offocused onjoined thestructurespreviously></iframe>once againbut ratherimmigrantsof course,a group ofLiteratureUnlike the</a>&nbsp;\nfunction it was theConventionautomobileProtestantaggressiveafter the Similarly," /></div>collection\r\nfunctionvisibilitythe use ofvolunteersattractionunder the threatened*<![CDATA[importancein generalthe latter</form>\n</.indexOf(\'i = 0; i <differencedevoted totraditionssearch forultimatelytournamentattributesso-called }\n</style>evaluationemphasizedaccessible</section>successionalong withMeanwhile,industries</a><br />has becomeaspects ofTelevisionsufficientbasketballboth sidescontinuingan article<img alt="adventureshis mothermanchesterprinciplesparticularcommentaryeffects ofdecided to"><strong>publishersJournal ofdifficultyfacilitateacceptablestyle.css"\tfunction innovation>Copyrightsituationswould havebusinessesDictionarystatementsoften usedpersistentin Januarycomprising</title>\n\tdiplomaticcontainingperformingextensionsmay not beconcept of onclick="It is alsofinancial making theLuxembourgadditionalare calledengaged in"script");but it waselectroniconsubmit="\n\x3c!-- End electricalofficiallysuggestiontop of theunlike theAustralianOriginallyreferences\n</head>\r\nrecognisedinitializelimited toAlexandriaretirementAdventuresfour years\n\n&lt;!-- increasingdecorationh3 class="origins ofobligationregulationclassified(function(advantagesbeing the historians<base hrefrepeatedlywilling tocomparabledesignatednominationfunctionalinside therevelationend of thes for the authorizedrefused totake placeautonomouscompromisepolitical restauranttwo of theFebruary 2quality ofswfobject.understandnearly allwritten byinterviews" width="1withdrawalfloat:leftis usuallycandidatesnewspapersmysteriousDepartmentbest knownparliamentsuppressedconvenientremembereddifferent systematichas led topropagandacontrolledinfluencesceremonialproclaimedProtectionli class="Scientificclass="no-trademarksmore than widespreadLiberationtook placeday of theas long asimprisonedAdditional\n<head>\n<mLaboratoryNovember 2exceptionsIndustrialvariety offloat: lefDuring theassessmenthave been deals withStatisticsoccurrence/ul></div>clearfix">the publicmany yearswhich wereover time,synonymouscontent">\npresumablyhis familyuserAgent.unexpectedincluding challengeda minorityundefined"belongs totaken fromin Octoberposition: said to bereligious Federation rowspan="only a fewmeant thatled to the--\x3e\r\n<div <fieldset>Archbishop class="nobeing usedapproachesprivilegesnoscript>\nresults inmay be theEaster eggmechanismsreasonablePopulationCollectionselected">noscript>\r/index.phparrival of-jssdk\'));managed toincompletecasualtiescompletionChristiansSeptember arithmeticproceduresmight haveProductionit appearsPhilosophyfriendshipleading togiving thetoward theguaranteeddocumentedcolor:#000video gamecommissionreflectingchange theassociatedsans-serifonkeypress; padding:He was theunderlyingtypically , and the srcElementsuccessivesince the should be networkingaccountinguse of thelower thanshows that</span>\n\t\tcomplaintscontinuousquantitiesastronomerhe did notdue to itsapplied toan averageefforts tothe futureattempt toTherefore,capabilityRepublicanwas formedElectronickilometerschallengespublishingthe formerindigenousdirectionssubsidiaryconspiracydetails ofand in theaffordablesubstancesreason forconventionitemtype="absolutelysupposedlyremained aattractivetravellingseparatelyfocuses onelementaryapplicablefound thatstylesheetmanuscriptstands for no-repeat(sometimesCommercialin Americaundertakenquarter ofan examplepersonallyindex.php?</button>\npercentagebest-knowncreating a" dir="ltrLieutenant\n<div id="they wouldability ofmade up ofnoted thatclear thatargue thatto anotherchildren\'spurpose offormulatedbased uponthe regionsubject ofpassengerspossession.\n\nIn the Before theafterwardscurrently across thescientificcommunity.capitalismin Germanyright-wingthe systemSociety ofpoliticiandirection:went on toremoval of New York apartmentsindicationduring theunless thehistoricalhad been adefinitiveingredientattendanceCenter forprominencereadyStatestrategiesbut in theas part ofconstituteclaim thatlaboratorycompatiblefailure of, such as began withusing the to providefeature offrom which/" class="geologicalseveral ofdeliberateimportant holds thating&quot; valign=topthe Germanoutside ofnegotiatedhis careerseparationid="searchwas calledthe fourthrecreationother thanpreventionwhile the education,connectingaccuratelywere builtwas killedagreementsmuch more Due to thewidth: 100some otherKingdom ofthe entirefamous forto connectobjectivesthe Frenchpeople andfeatured">is said tostructuralreferendummost oftena separate->\n<div id Official worldwide.aria-labelthe planetand it wasd" value="looking atbeneficialare in themonitoringreportedlythe modernworking onallowed towhere the innovative</a></div>soundtracksearchFormtend to beinput id="opening ofrestrictedadopted byaddressingtheologianmethods ofvariant ofChristian very largeautomotiveby far therange frompursuit offollow thebrought toin Englandagree thataccused ofcomes frompreventingdiv style=his or hertremendousfreedom ofconcerning0 1em 1em;Basketball/style.cssan earliereven after/" title=".com/indextaking thepittsburghcontent">\r<script>(fturned outhaving the</span>\r\n occasionalbecause itstarted tophysically></div>\n  created byCurrently, bgcolor="tabindex="disastrousAnalytics also has a><div id="</style>\n<called forsinger and.src = "//violationsthis pointconstantlyis locatedrecordingsd from thenederlandsportuguC*sW"WW(WW*YX\'X1X3[\fdesarrollocomentarioeducaciC3nseptiembreregistradodirecciC3nubicaciC3npublicidadrespuestasresultadosimportantereservadosartC-culosdiferentessiguientesrepC:blicasituaciC3nministerioprivacidaddirectorioformaciC3npoblaciC3npresidentecont',
      'enidosaccesoriostechnoratipersonalescategorC-aespecialesdisponibleactualidadreferenciavalladolidbibliotecarelacionescalendariopolC-ticasanterioresdocumentosnaturalezamaterialesdiferenciaeconC3micatransporterodrC-guezparticiparencuentrandiscusiC3nestructurafundaciC3nfrecuentespermanentetotalmenteP<P>P6P=P>P1QP4P5QP<P>P6P5QP2Q\0P5P<QQP0P:P6P5QQP>P1Q\vP1P>P;P5P5P>QP5P=Q\fQ\rQP>P3P>P:P>P3P4P0P?P>QP;P5P2QP5P3P>QP0P9QP5QP5Q\0P5P7P<P>P3QQQP0P9QP0P6P8P7P=P8P<P5P6P4QP1QP4QQPP>P8QP:P7P4P5QQ\fP2P8P4P5P>QP2QP7P8P=QP6P=P>QP2P>P5P9P;QP4P5P9P?P>Q\0P=P>P<P=P>P3P>P4P5QP5P9QP2P>P8QP?Q\0P0P2P0QP0P:P>P9P<P5QQP>P8P<P5P5QP6P8P7P=Q\fP>P4P=P>P9P;QQQ\bP5P?P5Q\0P5P4QP0QQP8QP0QQQ\fQ\0P0P1P>QP=P>P2Q\vQP?Q\0P0P2P>QP>P1P>P9P?P>QP>P<P<P5P=P5P5QP8QP;P5P=P>P2Q\vP5QQP;QP3P>P:P>P;P>P=P0P7P0P4QP0P:P>P5QP>P3P4P0P?P>QQP8PP>QP;P5QP0P:P8P5P=P>P2Q\vP9QQP>P8QQP0P:P8QQQ\0P0P7QP!P0P=P:QQP>Q\0QP<PP>P3P4P0P:P=P8P3P8QP;P>P2P0P=P0Q\bP5P9P=P0P9QP8QP2P>P8P<QP2QP7Q\fP;QP1P>P9QP0QQP>QQ\0P5P4P8PQ\0P>P<P5P$P>Q\0QP<Q\0Q\vP=P:P5QQP0P;P8P?P>P8QP:QQ\vQQQP<P5QQQQP5P=QQ\0QQ\0QP4P0QP0P<Q\vQQ\0Q\vP=P:P0PP>P2Q\vP9QP0QP>P2P<P5QQP0QP8P;Q\fP<P<P0Q\0QP0QQQ\0P0P=P<P5QQP5QP5P:QQP=P0Q\bP8QP<P8P=QQP8P<P5P=P8P8P<P5QQP=P>P<P5Q\0P3P>Q\0P>P4QP0P<P>P<Q\rQP>P<QP:P>P=QP5QP2P>P5P<P:P0P:P>P9PQ\0QP8P2YYX*X/Y\tX%X1X3X\'YX1X3X\'YX)X\'YX9X\'YYX*X(YX\'X(X1X\'YX,X\'YY\nY\bYX\'YX5Y\bX1X,X/Y\nX/X)X\'YX9X6Y\bX%X6X\'YX)X\'YYX3YX\'YX9X\'X(X*X-YY\nYYYYX\'X*YYX*YY\tX*X9X/Y\nYX\'YX4X9X1X#X.X(X\'X1X*X7Y\bY\nX1X9YY\nYYX%X1YX\'YX7YX(X\'X*X\'YYX:X)X*X1X*Y\nX(X\'YYX\'X3X\'YX4Y\nX.YYX*X/Y\nX\'YX9X1X(X\'YYX5X5X\'YYX\'YX9YY\nYX\'X*X-X/Y\nX+X\'YYYYX\'YX9YYYYX*X(X)Y\nYYYYX\'YX7YYYY\nX/Y\nY\bX%X/X\'X1X)X*X\'X1Y\nX.X\'YX5X-X)X*X3X,Y\nYX\'YY\bYX*X9YX/YX\'YX/Y\nYX)X*X5YY\nYX#X1X4Y\nYX\'YX0Y\nYX9X1X(Y\nX)X(Y\bX\'X(X)X#YX9X\'X(X\'YX3YX1YX4X\'YYX*X9X\'YY\tX\'YX#Y\bYX\'YX3YX)X,X\'YX9X)X\'YX5X-YX\'YX/Y\nYYYYX\'X*X\'YX.X\'X5X\'YYYYX#X9X6X\'X!YX*X\'X(X)X\'YX.Y\nX1X1X3X\'X&YX\'YYYX(X\'YX#X/X(YYX\'X7X9YX1X\'X3YYYX7YX)X\'YYX*X(X\'YX1X,YX\'X4X*X1YX\'YYX/YY\nX9X7Y\nYsByTagName(.jpg" alt="1px solid #.gif" alt="transparentinformationapplication" onclick="establishedadvertising.png" alt="environmentperformanceappropriate&amp;mdash;immediately</strong></rather thantemperaturedevelopmentcompetitionplaceholdervisibility:copyright">0" height="even thoughreplacementdestinationCorporation<ul class="AssociationindividualsperspectivesetTimeout(url(http://mathematicsmargin-top:eventually description) no-repeatcollections.JPG|thumb|participate/head><bodyfloat:left;<li class="hundreds of\n\nHowever, compositionclear:both;cooperationwithin the label for="border-top:New Zealandrecommendedphotographyinteresting&lt;sup&gt;controversyNetherlandsalternativemaxlength="switzerlandDevelopmentessentially\n\nAlthough </textarea>thunderbirdrepresented&amp;ndash;speculationcommunitieslegislationelectronics\n\t<div id="illustratedengineeringterritoriesauthoritiesdistributed6" height="sans-serif;capable of disappearedinteractivelooking forit would beAfghanistanwas createdMath.floor(surroundingcan also beobservationmaintenanceencountered<h2 class="more recentit has beeninvasion of).getTime()fundamentalDespite the"><div id="inspirationexaminationpreparationexplanation<input id="</a></span>versions ofinstrumentsbefore the  = \'http://Descriptionrelatively .substring(each of theexperimentsinfluentialintegrationmany peopledue to the combinationdo not haveMiddle East<noscript><copyright" perhaps theinstitutionin Decemberarrangementmost famouspersonalitycreation oflimitationsexclusivelysovereignty-content">\n<td class="undergroundparallel todoctrine ofoccupied byterminologyRenaissancea number ofsupport forexplorationrecognitionpredecessor<img src="/<h1 class="publicationmay also bespecialized</fieldset>progressivemillions ofstates thatenforcementaround the one another.parentNodeagricultureAlternativeresearcherstowards theMost of themany other (especially<td width=";width:100%independent<h3 class=" onchange=").addClass(interactionOne of the daughter ofaccessoriesbranches of\r\n<div id="the largestdeclarationregulationsInformationtranslationdocumentaryin order to">\n<head>\n<" height="1across the orientation);</script>implementedcan be seenthere was ademonstratecontainer">connectionsthe Britishwas written!important;px; margin-followed byability to complicatedduring the immigrationalso called<h4 class="distinctionreplaced bygovernmentslocation ofin Novemberwhether the</p>\n</div>acquisitioncalled the persecutiondesignation{font-size:appeared ininvestigateexperiencedmost likelywidely useddiscussionspresence of (document.extensivelyIt has beenit does notcontrary toinhabitantsimprovementscholarshipconsumptioninstructionfor exampleone or morepx; paddingthe currenta series ofare usuallyrole in thepreviously derivativesevidence ofexperiencescolorschemestated thatcertificate</a></div>\n selected="high schoolresponse tocomfortableadoption ofthree yearsthe countryin Februaryso that thepeople who provided by<param nameaffected byin terms ofappointmentISO-8859-1"was born inhistorical regarded asmeasurementis based on and other : function(significantcelebrationtransmitted/js/jquery.is known astheoretical tabindex="it could be<noscript>\nhaving been\r\n<head>\r\n< &quot;The compilationhe had beenproduced byphilosopherconstructedintended toamong othercompared toto say thatEngineeringa differentreferred todifferencesbelief thatphotographsidentifyingHistory of Republic ofnecessarilyprobabilitytechnicallyleaving thespectacularfraction ofelectricityhead of therestaurantspartnershipemphasis onmost recentshare with saying thatfilled withdesigned toit is often"></iframe>as follows:merged withthrough thecommercial pointed outopportunityview of therequirementdivision ofprogramminghe receivedsetInterval"></span></in New Yorkadditional compression\n\n<div id="incorporate;</script><attachEventbecame the " target="_carried outSome of thescience andthe time ofContainer">maintainingChristopherMuch of thewritings of" height="2size of theversion of mixture of between theExamples ofeducationalcompetitive onsubmit="director ofdistinctive/DTD XHTML relating totendency toprovince ofwhich woulddespite thescientific legislature.innerHTML allegationsAgriculturewas used inapproach tointelligentyears later,sans-serifdeterminingPerformanceappearances, which is foundationsabbreviatedhigher thans from the individual composed ofsupposed toclaims thatattributionfont-size:1elements ofHistorical his brotherat the timeanniversarygoverned byrelated to ultimately innovationsit is stillcan only bedefinitionstoGMTStringA number ofimg class="Eventually,was changedoccurred inneighboringdistinguishwhen he wasintroducingterrestrialMany of theargues thatan Americanconquest ofwidespread were killedscreen and In order toexpected todescendantsare locatedlegislativegenerations backgroundmost peopleyears afterthere is nothe highestfrequently they do notargued thatshowed thatpredominanttheologicalby the timeconsideringshort-lived</span></a>can be usedvery littleone of the had alreadyinterpretedcommunicatefeatures ofgovernment,</noscript>entered the" height="3Independentpopulationslarge-scale. Although used in thedestructionpossibilitystarting intwo or moreexpressionssubordinatelarger thanhistory and</option>\r\nContinentaleliminatingwill not bepractice ofin front ofsite of theensure thatto create amississippipotentiallyoutstandingbetter thanwhat is nowsituated inmeta name="TraditionalsuggestionsTranslationthe form ofatmosphericideologicalenterprisescalculatingeast of theremnants ofpluginspage/index.php?remained intransformedHe was alsowas alreadystatisticalin favor ofMinistry ofmovement offormulationis required<link rel="This is the <a href="/popularizedinvolved inare used toand severalmade by theseems to belikely thatPalestiniannamed afterit had beenmost commonto refer tobut this isconsecutivetemporarilyIn general,conventionstakes placesubdivisionterritorialoperationalpermanentlywas largelyoutbreak ofin the pastfollowing a xmlns:og="><a class="class="textConversion may be usedmanufactureafter beingclearfix">\nquestion ofwas electedto become abecause of some peopleinspired bysuccessful a time whenmore commonamongst thean officialwidth:100%;technology,was adoptedto keep thesettlementslive birthsindex.html"Connecticutassigned to&amp;times;account foralign=rightthe companyalways beenreturned toinvolvementBecause thethis period" name="q" confined toa result ofvalue="" />is actuallyEnvironment\r\n</head>\r\nConversely,>\n<div id="0" width="1is probablyhave becomecontrollingthe problemcitizens ofpoliticiansreached theas early as:none; over<table cellvalidity ofdirectly toonmousedownwhere it iswhen it wasmembers of relation toaccommodatealong with In the latethe Englishdelicious">this is notthe presentif they areand finallya matter of\r\n\t</div>\r\n\r\n</script>faster thanmajority ofafter whichcomparativeto maintainimprove theawarded theer" class="frameborderrestorationin the sameanalysis oftheir firstDuring the continentalsequence offunction(){font-size: work on the</script>\n<begins withjavascript:constituentwas foundedequilibriumassume thatis given byneeds to becoordinatesthe variousare part ofonly in thesections ofis a commontheories ofdiscoveriesassociationedge of thestrength ofposition inpresent-dayuniversallyto form thebut insteadcorporationattached tois commonlyreasons for &quot;the can be madewas able towhich meansbut did notonMouseOveras possibleoperated bycoming fromthe primaryaddition offor severaltransferreda period ofare able tohowever, itshould havemuch larger\n\t</script>adopted theproperty ofdirected byeffectivelywas broughtchildren ofProgramminglonger thanmanuscriptswar againstby means ofand most ofsimilar to proprietaryoriginatingprestigiousgrammaticalexperience.to make theIt was alsois found incompetitorsin the U.S.replace thebrought thecalculationfall of thethe generalpracticallyin honor ofreleased inresidentialand some ofking of thereaction to1st Earl ofculture andprincipally</title>\n  they can beback to thesome of hisexposure toare similarform of theaddFavoritecitizenshippart in thepeople within practiceto continue&amp;minus;approved by the first allowed theand for thefunctioningplaying thesolution toheight="0" in his bookmore than afollows thecreated thepresence in&nbsp;</td>nationalistthe idea ofa characterwere forced class="btndays of thefeatured inshowing theinterest inin place ofturn of thethe head ofLord of thepoliticallyhas its ownEducationalapproval ofsome of theeach other,behavior ofand becauseand anotherappeared onrecorded inblack&quot;may includethe world\'scan lead torefers to aborder="0" government winning theresulted in while the Washington,the subjectcity in the></div>\r\n\t\treflect theto completebecame moreradioactiverejected bywithout anyhis father,which couldcopy of theto indicatea politicalaccounts ofconstitutesworked wither</a></li>of his lifeaccompaniedclientWidthprevent theLegislativedifferentlytogether inhas severalfor anothertext of thefounded thee with the is used forchanged theusually theplace wherewhereas the> <a href=""><a href="themselves,although hethat can betraditionalrole of theas a resultremoveChilddesigned bywest of theSome peopleproduction,side of thenewslettersused by thedown to theaccepted bylive in theattempts tooutside thefrequenciesHowever, inprogrammersat least inapproximatealthough itwas part ofand variousGovernor ofthe articleturned into><a href="/the economyis the mostmost widelywould laterand perhapsrise to theoccurs whenunder whichconditions.the westerntheory thatis producedthe city ofin which heseen in thethe centralbuilding ofmany of hisarea of theis the onlymost of themany of thethe WesternThere is noextended toStatisticalcolspan=2 |short storypossible totopologicalcritical ofreported toa Christiandecision tois equal toproblems ofThis can bemerchandisefor most ofno evidenceeditions ofelements in&quot;. Thecom/images/which makesthe processremains theliterature,is a memberthe popularthe ancientproblems intime of thedefeated bybody of thea few yearsmuch of thethe work ofCalifornia,served as agovernment.concepts ofmovement in\t\t<div id="it" value="language ofas they areproduced inis that theexplain thediv></div>\nHowever thelead to the\t<a href="/was grantedpeople havecontinuallywas seen asand relatedthe role ofproposed byof the besteach other.Constantinepeople fromdialects ofto revisionwas renameda source ofthe initiallaunched inprovide theto the westwhere thereand similarbetween twois also theEnglish andconditions,that it wasentitled tothemselves.quantity ofransparencythe same asto join thecountry andthis is theThis led toa statementcontrast tolastIndexOfthrough hisis designedthe term isis providedprotect theng</a></li>The currentthe site ofsubstantialexperience,in the Westthey shouldslovenD\rinacomentariosuniversidadcondicionesactividadesexperienciatecnologC-aproducciC3npuntuaciC3naplicaciC3ncontraseC1acategorC-asregistrarseprofesionaltratamientoregC-stratesecretarC-aprincipalesprotecciC3nimportantesimportanciaposibilidadinteresantecrecimientonecesidadessuscribirseasociaciC3ndisponiblesevaluaciC3nestudiantesresponsableresoluciC3nguadalajararegistradosoportunidadcomercialesfotografC-aautoridadesingenierC-atelevisiC3ncompetenciaoperacionesestablecidosimplementeactualmentenavegaciC3nconformidadline-height:font-family:" : "http://applicationslink" href="specifically//<![CDATA[\nOrganizationdistribution0px; height:relationshipdevice-width<div class="<label for="registration</noscript>\n/index.html"window.open( !important;application/independence//www.googleorganizationautocompleterequirementsconservative<form name="intellectualmargin-left:18th centuryan importantinstitutionsabbreviation<img class="organisationcivilization19th centuryarchitectureincorporated20th century-container">most notably/></a></div>notification\'undefined\')Furthermore,believe thatinnerHTML = prior to thedramaticallyreferring tonegotiationsheadquartersSouth AfricaunsuccessfulPennsylvaniaAs a result,<html lang="&lt;/sup&gt;dealing withphiladelphiahistorically);</script>\npadding-top:experimentalgetAttributeinstructionstechnologiespart of the =function(){subscriptionl.dtd">\r\n<htgeographicalConstitution\', function(supported byagriculturalconstructionpublicationsfont-size: 1a variety of<div style="Encyclopediaiframe src="demonstratedaccomplisheduniversitiesDemographics);</script><dedicated toknowledge ofsatisfactionparticularly</div></div>English (US)appendChild(transmissions. However, intelligence" tabindex="float:right;Commonwealthranging fromin which theat least onereproductionencyclopedia;font-size:1jurisdictionat that time"><a class="In addition,description+conversationcontact withis generallyr" content="representing&lt;math&gt;presentationoccasionally<img width="navigation">compensationchampionshipmedia="all" violation ofreference toreturn true;Strict//EN" transactionsinterventionverificationInformation difficultiesChampionshipcapabilities<![endif]--\x3e}\n</script>\nChristianityfor example,Professionalrestrictionssuggest thatwas released(such as theremoveClass(unemploymentthe Americanstructure of/index.html published inspan class=""><a href="/introductionbelonging toclaimed thatconsequences<meta name="Guide to theoverwhelmingagainst the concentrated,\n.nontouch observations</a>\n</div>\nf (document.border: 1px {font-size:1treatment of0" height="1modificationIndependencedivided intogreater thanachievementsestablishingJavaScript" neverthelesssignificanceBroadcasting>&nbsp;</td>container">\nsuch as the influence ofa particularsrc=\'http://navigation" half of the substantial &nbsp;</div>advantage ofdiscovery offundamental metropolitanthe opposite" xml:lang="deliberatelyalign=centerevolution ofpreservationimprovementsbeginning inJesus ChristPublicationsdisagreementtext-align:r, function()similaritiesbody></html>is currentlyalphabeticalis sometimestype="image/many of the flow:hidden;available indescribe theexistence ofall over thethe Internet\t<ul class="installationneighborhoodarmed forcesreducing thecontinues toNonetheless,temperatures\n\t\t<a href="close to theexamples of is about the(see below)." id="searchprofessionalis availablethe official\t\t</script>\n\n\t\t<div id="accelerationthrough the Hall of Famedescriptionstranslationsinterference type=\'text/recent yearsin the worldvery popular{background:traditional some of the connected toexploitationemergence ofconstitutionA History ofsignificant manufacturedexpectations><noscript><can be foundbecause the has not beenneighbouringwithout the added to the\t<li class="instrumentalSoviet Unionacknowledgedwhich can bename for theattention toattempts to developmentsIn fact, the<li class="aimplicationssuitable formuch of the colonizationpresidentialcancelBubble Informationmost of the is describedrest of the more or lessin SeptemberIntelligencesrc="http://px; height: available tomanufacturerhuman rightslink href="/availabilityproportionaloutside the astronomicalhuman beingsname of the are found inare based onsmaller thana person whoexpansion ofarguing thatnow known asIn the earlyintermediatederived fromScandinavian</a></div>\r\nconsider thean estimatedthe National<div id="pagresulting incommissionedanalogous toare required/ul>\n</div>\nwas based onand became a&nbsp;&nbsp;t" value="" was capturedno more thanrespectivelycontinue to >\r\n<head>\r\n<were createdmore generalinformation used for theindependent the Imperialcomponent ofto the northinclude the Constructionside of the would not befor instanceinvention ofmore complexcollectivelybackground: text-align: its originalinto accountthis processan extensivehowever, thethey are notrejected thecriticism ofduring whichprobably thethis article(function(){It should bean agreementaccidentallydiffers fromArchitecturebetter knownarrangementsinfluence onattended theidentical tosouth of thepass throughxml" title="weight:bold;creating thedisplay:nonereplaced the<img src="/ihttps://www.World War IItestimonialsfound in therequired to and that thebetween the was designedconsists of considerablypublished bythe languageConservationconsisted ofrefer to theback to the css" media="People from available onproved to besuggestions"was known asvarieties oflikely to becomprised ofsupport the hands of thecoupled withconnect and border:none;performancesbefore beinglater becamecalculationsoften calledresidents ofmeaning that><li class="evidence forexplanationsenvironments"></a></div>which allowsIntroductiondeveloped bya wide rangeon behalf ofvalign="top"principle ofat the time,</noscript>\rsaid to havein the firstwhile othershypotheticalphilosopherspower of thecontained inperformed byinability towere writtenspan style="input name="the questionintended forrejection ofimplies thatinvented thethe standardwas probablylink betweenprofessor ofinteractionschanging theIndian Ocean class="lastworking with\'http://www.years beforeThis was therecreationalentering themeasurementsan extremelyvalue of thestart of the\n</script>\n\nan effort toincrease theto the southspacing="0">sufficientlythe Europeanconverted toclearTimeoutdid not haveconsequentlyfor the nextextension ofeconomic andalthough theare producedand with theinsufficientgiven by thestating thatexpenditures</span></a>\nthought thaton the basiscellpadding=image of thereturning toinformation,separated byassassinateds" content="authority ofnorthwestern</div>\n<div "></div>\r\n  consultationcommunity ofthe nationalit should beparticipants align="leftthe greatestselection ofsupernaturaldependent onis mentionedallowing thewas inventedaccompanyinghis personalavailable atstudy of theon the otherexecution ofHuman Rightsterms of theassociationsresearch andsucceeded bydefeated theand from thebut they arecommander ofstate of theyears of agethe study of<ul class="splace in thewhere he was<li class="fthere are nowhich becamehe publishedexpressed into which thecommissionerfont-weight:territory ofextensions">Roman Empireequal to theIn contrast,however, andis typicallyand his wife(also called><ul class="effectively evolved intoseem to havewhich is thethere was noan excellentall of thesedescribed byIn practice,broadcastingcharged withreflected insubjected tomilitary andto the pointeconomicallysetTargetingare actuallyvictory over();</script>continuouslyrequired forevolutionaryan effectivenorth of the, which was front of theor otherwisesome form ofhad not beengenerated byinformation.permitted toincludes thedevelopment,entered intothe previousconsistentlyare known asthe field ofthis type ofgiven to thethe title ofcontains theinstances ofin the northdue to theirare designedcorporationswas that theone of thesemore popularsucceeded insupport fromin differentdominated bydesigned forownership ofand possiblystandardizedresponseTextwas intendedreceived theassumed thatareas of theprimarily inthe basis ofin the senseaccounts fordestroyed byat least twowas declaredcould not beSecretary ofappear to bemargin-top:1/^\\s+|\\s+$/ge){throw e};the start oftwo separatelanguage andwho had beenoperation ofdeath of thereal numbers\t<link rel="provided thethe story ofcompetitionsenglish (UK)english (US)PP>P=P3P>P;P!Q\0P?QP:P8QQ\0P?QP:P8QQ\0P?QP:P>YX9X1X(Y\nX)f-#i+d8-fg.\0d=d8-fg9d=d8-ff\tie,e8d::f0f?e:i?i\fe74e74g$>d<d8;d9\tf\rd=g3;g;f?g-f3h\'informaciC3nherramientaselectrC3nicodescripciC3nclasificadosconocimientopublicaciC3nrelacionadasinformC!ticarelacionadosdepartamentotrabajadoresdirectamenteayuntamientomercadoLibrecontC!ctenoshabitacionescumplimientorestaurantesdisposiciC3nconsecuenciaelectrC3nicaaplicacionesdesconectadoinstalaciC3nrealizaciC3nutilizaciC3nenciclopediaenfermedadesinstrumentosexperienciasinstituciC3nparticularessubcategoriaQP>P;Q\fP:P>P P>QQP8P8Q\0P0P1P>QQ\vP1P>P;Q\fQ\bP5P?Q\0P>QQP>P<P>P6P5QP5P4Q\0QP3P8QQP;QQP0P5QP5P9QP0QP2QP5P3P4P0P P>QQP8QPP>QP:P2P5P4Q\0QP3P8P5P3P>Q\0P>P4P0P2P>P?Q\0P>QP4P0P=P=Q\vQP4P>P;P6P=Q\vP8P<P5P=P=P>PP>QP:P2Q\vQ\0QP1P;P5P9PP>QP:P2P0QQQ\0P0P=Q\vP=P8QP5P3P>Q\0P0P1P>QP5P4P>P;P6P5P=QQP;QP3P8QP5P?P5Q\0Q\fPP4P=P0P:P>P?P>QP>P<QQ\0P0P1P>QQP0P?Q\0P5P;QP2P>P>P1Q\tP5P>P4P=P>P3P>QP2P>P5P3P>QQP0QQ\fP8P4Q\0QP3P>P9QP>Q\0QP<P5QP>Q\0P>Q\bP>P?Q\0P>QP8P2QQQ\vP;P:P0P:P0P6P4Q\vP9P2P;P0QQP8P3Q\0QP?P?Q\vP2P<P5QQP5Q\0P0P1P>QP0QP:P0P7P0P;P?P5Q\0P2Q\vP9P4P5P;P0QQ\fP4P5P=Q\fP3P8P?P5Q\0P8P>P4P1P8P7P=P5QP>QP=P>P2P5P<P>P<P5P=QP:QP?P8QQ\fP4P>P;P6P=P0Q\0P0P<P:P0QP=P0QP0P;P>P P0P1P>QP0P"P>P;Q\fP:P>QP>P2QP5P<P2QP>Q\0P>P9P=P0QP0P;P0QP?P8QP>P:QP;QP6P1Q\vQP8QQP5P<P?P5QP0QP8P=P>P2P>P3P>P?P>P<P>Q\tP8QP0P9QP>P2P?P>QP5P<QP?P>P<P>Q\tQ\fP4P>P;P6P=P>QQQ\vP;P:P8P1Q\vQQQ\0P>P4P0P=P=Q\vP5P<P=P>P3P8P5P?Q\0P>P5P:QP!P5P9QP0QP<P>P4P5P;P8QP0P:P>P3P>P>P=P;P0P9P=P3P>Q\0P>P4P5P2P5Q\0QP8QQQQ\0P0P=P5QP8P;Q\fP<Q\vQQ\0P>P2P=QQ\0P0P7P=Q\vQP8QP:P0QQ\fP=P5P4P5P;QQP=P2P0Q\0QP<P5P=Q\fQ\bP5P<P=P>P3P8QP4P0P=P=P>P9P7P=P0QP8QP=P5P;Q\fP7QQP>Q\0QP<P0P"P5P?P5Q\0Q\fP<P5QQQP0P7P0Q\tP8QQ\vPQQQ\bP8P5`$(`$9`%\0`$`$`$0`$(`%`$`$*`$(`%`$`$?`$/`$>`$`$0`%`$`$`$(`%\r`$/`$`%\r`$/`$>`$`$>`$`$!`$,`$>`$0`%`$`$?`$8`%\0`$&`$?`$/`$>`$*`$9`$2`%`$8`$?`$`$9`$-`$>`$0`$$`$`$*`$(`%\0`$5`$>`$2`%`$8`%`$5`$>`$`$0`$$`%`$.`%`$0`%`$9`%\v`$(`%`$8`$`$$`%`$,`$9`%`$$`$8`$>`$`$`$9`%\v`$`$>`$`$>`$(`%`$.`$?`$(`$`$`$0`$$`$>`$`$0`$(`$>`$\t`$(`$`%`$/`$9`$>`$`$8`$,`$8`%`$-`$>`$7`$>`$`$*`$`%`$2`$?`$/`%`$6`%`$0`%`$`$8`$`%`$`$`$`%`$.`%`$0`%\0`$8`$`$$`$>`$.`%`$0`$>`$2`%`$`$0`$`$\'`$?`$`$`$*`$(`$>`$8`$.`$>`$`$.`%`$`%`$`$>`$0`$#`$9`%\v`$$`$>`$`$!`$<`%\0`$/`$9`$>`$`$9`%\v`$`$2`$6`$,`%\r`$&`$2`$?`$/`$>`$`%\0`$5`$(`$`$>`$$`$>`$`%\b`$8`%`$`$*`$`$>`$5`$>`$2`%\0`$&`%`$(`%`$*`%`$0`%\0`$*`$>`$(`%\0`$\t`$8`$`%`$9`%\v`$`%\0`$,`%\b`$ `$`$`$*`$`%\0`$5`$0`%\r`$7`$`$>`$`$5`$`$*`$`%\v`$`$?`$2`$>`$`$>`$(`$>`$8`$9`$.`$$`$9`$.`%`$`$\t`$(`$`%\0`$/`$>`$9`%`$&`$0`%\r`$`$8`%`$`%\0`$*`$8`$`$&`$8`$5`$>`$2`$9`%\v`$(`$>`$9`%\v`$$`%\0`$`%\b`$8`%`$5`$>`$*`$8`$`$(`$$`$>`$(`%`$$`$>`$`$>`$0`%\0`$`$>`$/`$2`$`$?`$2`%`$(`%\0`$`%`$`$>`$`$`$*`$$`%\r`$0`$`%`$`$2`$`$>`$$`%`$,`$>`$9`$0`$`$*`$(`%`$5`$>`$9`$(`$`$8`$`$>`$8`%`$,`$9`$0`$9`$(`%`$`$8`$8`%`$8`$9`$?`$$`$,`$!`$<`%`$`$`$(`$>`$$`$2`$>`$6`$*`$>`$`$`$6`%\r`$0`%\0`$,`$!`$<`%\0`$9`%\v`$$`%`$8`$>`$\b`$`$6`$>`$/`$&`$8`$`$$`%\0`$`$>`$$`%\0`$5`$>`$2`$>`$9`$`$>`$0`$*`$`$(`$>`$0`$`$(`%`$8`$!`$<`$`$.`$?`$2`$>`$\t`$8`$`%\0`$`%`$5`$2`$2`$`$$`$>`$`$>`$(`$>`$`$0`%\r`$%`$`$9`$>`$`$&`%`$`$>`$*`$9`$2`%\0`$(`$?`$/`$.`$,`$?`$(`$>`$,`%\b`$`$`$`$9`%\0`$`$`$9`$(`$>`$&`%`$$`$>`$9`$.`$2`%`$`$>`$+`%\0`$`$,`$`$?`$$`%`$0`$$`$.`$>`$`$`$5`$9`%\0`$`$0`%\v`$`$<`$.`$?`$2`%\0`$`$0`%\v`$*`$8`%`$(`$>`$/`$>`$&`$5`$2`%`$(`%`$`$>`$$`$>`$`$0`%\0`$,`$\t`$(`$`$>`$`$5`$>`$,`$*`%`$0`$>`$,`$!`$<`$>`$8`%\f`$&`$>`$6`%`$/`$0`$`$?`$/`%`$`$9`$>`$`$`$`$8`$0`$,`$(`$>`$`$5`$9`$>`$`$8`%\r`$%`$2`$.`$?`$2`%`$2`%`$`$`$5`$?`$7`$/`$`%\r`$0`$`$8`$.`%`$9`$%`$>`$(`$>X*X3X*X7Y\nX9YX4X\'X1YX)X(Y\bX\'X3X7X)X\'YX5YX-X)YY\bX\'X6Y\nX9X\'YX.X\'X5X)X\'YYX2Y\nX/X\'YX9X\'YX)X\'YYX\'X*X(X\'YX1X/Y\bX/X(X1YX\'YX,X\'YX/Y\bYX)X\'YX9X\'YYX\'YYY\bYX9X\'YX9X1X(Y\nX\'YX3X1Y\nX9X\'YX,Y\bX\'YX\'YX0YX\'X(X\'YX-Y\nX\'X)X\'YX-YY\bYX\'YYX1Y\nYX\'YX9X1X\'YYX-YY\bX8X)X\'YX+X\'YY\nYX4X\'YX/X)X\'YYX1X#X)X\'YYX1X"YX\'YX4X(X\'X(X\'YX-Y\bX\'X1X\'YX,X/Y\nX/X\'YX#X3X1X)X\'YX9YY\bYYX,YY\bX9X)X\'YX1X-YYX\'YYYX\'X7YYX3X7Y\nYX\'YYY\bY\nX*X\'YX/YY\nX\'X(X1YX\'X*YX\'YX1Y\nX\'X6X*X-Y\nX\'X*Y\nX(X*Y\bYY\nX*X\'YX#Y\bYY\tX\'YX(X1Y\nX/X\'YYYX\'YX\'YX1X\'X(X7X\'YX4X.X5Y\nX3Y\nX\'X1X\'X*X\'YX+X\'YX+X\'YX5YX\'X)X\'YX-X/Y\nX+X\'YX2Y\bX\'X1X\'YX.YY\nX,X\'YX,YY\nX9X\'YX9X\'YYX\'YX,YX\'YX\'YX3X\'X9X)YX4X\'YX/YX\'YX1X&Y\nX3X\'YX/X.Y\bYX\'YYYY\nX)X\'YYX*X\'X(X\'YX/Y\bX1Y\nX\'YX/X1Y\bX3X\'X3X*X:X1YX*X5X\'YY\nYX\'YX(YX\'X*X\'YX9X8Y\nYentertainmentunderstanding = function().jpg" width="configuration.png" width="<body class="Math.random()contemporary United Statescircumstances.appendChild(organizations<span class=""><img src="/distinguishedthousands of communicationclear"></div>investigationfavicon.ico" margin-right:based on the Massachusettstable border=internationalalso known aspronunciationbackground:#fpadding-left:For example, miscellaneous&lt;/math&gt;psychologicalin particularearch" type="form method="as opposed toSupreme Courtoccasionally Additionally,North Americapx;backgroundopportunitiesEntertainment.toLowerCase(manufacturingprofessional combined withFor instance,consisting of" maxlength="return false;consciousnessMediterraneanextraordinaryassassinationsubsequently button type="the number ofthe original comprehensiverefers to the</ul>\n</div>\nphilosophicallocation.hrefwas publishedSan Francisco(function(){\n<div id="mainsophisticatedmathematical /head>\r\n<bodysuggests thatdocumentationconcentrationrelationshipsmay have been(for example,This article in some casesparts of the definition ofGreat Britain cellpadding=equivalent toplaceholder="; font-size: justificationbelieved thatsuffered fromattempted to leader of thecript" src="/(function() {are available\n\t<link rel=" src=\'http://interested inconventional " alt="" /></are generallyhas also beenmost popular correspondingcredited withtyle="border:</a></span></.gif" width="<iframe src="table class="inline-block;according to together withapproximatelyparliamentarymore and moredisplay:none;traditionallypredominantly&nbsp;|&nbsp;&nbsp;</span> cellspacing=<input name="or" content="controversialproperty="og:/x-shockwave-demonstrationsurrounded byNevertheless,was the firstconsiderable Although the collaborationshould not beproportion of<span style="known as the shortly afterfor instance,described as /head>\n<body starting withincreasingly the fact thatdiscussion ofmiddle of thean individualdifficult to point of viewhomosexualityacceptance of</span></div>manufacturersorigin of thecommonly usedimportance ofdenominationsbackground: #length of thedeterminationa significant" border="0">revolutionaryprinciples ofis consideredwas developedIndo-Europeanvulnerable toproponents ofare sometimescloser to theNew York City name="searchattributed tocourse of themathematicianby the end ofat the end of" border="0" technological.removeClass(branch of theevidence that![endif]--\x3e\r\nInstitute of into a singlerespectively.and thereforeproperties ofis located insome of whichThere is alsocontinued to appearance of &amp;ndash; describes theconsiderationauthor of theindependentlyequipped withdoes not have</a><a href="confused with<link href="/at the age ofappear in theThese includeregardless ofcould be used style=&quot;several timesrepresent thebody>\n</html>thought to bepopulation ofpossibilitiespercentage ofaccess to thean attempt toproduction ofjquery/jquerytwo differentbelong to theestablishmentreplacing thedescription" determine theavailable forAccording to wide range of\t<div class="more commonlyorganisationsfunctionalitywas completed &amp;mdash; participationthe characteran additionalappears to befact that thean example ofsignificantlyonmouseover="because they async = true;problems withseems to havethe result of src="http://familiar withpossession offunction () {took place inand sometimessubstantially<span></span>is often usedin an attemptgreat deal ofEnvironmentalsuccessfully virtually all20th century,professionalsnecessary to determined bycompatibilitybecause it isDictionary ofmodificationsThe followingmay refer to:Consequently,Internationalalthough somethat would beworld\'s firstclassified asbottom of the(particularlyalign="left" most commonlybasis for thefoundation ofcontributionspopularity ofcenter of theto reduce thejurisdictionsapproximation onmouseout="New Testamentcollection of</span></a></in the Unitedfilm director-strict.dtd">has been usedreturn to thealthough thischange in theseveral otherbut there areunprecedentedis similar toespecially inweight: bold;is called thecomputationalindicate thatrestricted to\t<meta name="are typicallyconflict withHowever, the An example ofcompared withquantities ofrather than aconstellationnecessary forreported thatspecificationpolitical and&nbsp;&nbsp;<references tothe same yearGovernment ofgeneration ofhave not beenseveral yearscommitment to\t\t<ul class="visualization19th century,practitionersthat he wouldand continuedoccupation ofis defined ascentre of thethe amount of><div style="equivalent ofdifferentiatebrought aboutmargin-left: automaticallythought of asSome of these\n<div class="input class="replaced withis one of theeducation andinfluenced byreputation as\n<meta name="accommodation</div>\n</div>large part ofInstitute forthe so-called against the In this case,was appointedclaimed to beHowever, thisDepartment ofthe remainingeffect on theparticularly deal with the\n<div style="almost alwaysare currentlyexpression ofphilosophy offor more thancivilizationson the islandselectedIndexcan result in" value="" />the structure /></a></div>Many of thesecaused by theof the Unitedspan class="mcan be tracedis related tobecame one ofis frequentlyliving in thetheoreticallyFollowing theRevolutionarygovernment inis determinedthe politicalintroduced insufficient todescription">short storiesseparation ofas to whetherknown for itswas initiallydisplay:blockis an examplethe principalconsists of arecognized as/body></html>a substantialreconstructedhead of stateresistance toundergraduateThere are twogravitationalare describedintentionallyserved as theclass="headeropposition tofundamentallydominated theand the otheralliance withwas forced torespectively,and politicalin support ofpeople in the20th century.and publishedloadChartbeatto understandmember statesenvironmentalfirst half ofcountries andarchitecturalbe consideredcharacterizedclearIntervalauthoritativeFederation ofwas succeededand there area consequencethe Presidentalso includedfree softwaresuccession ofdeveloped thewas destroyedaway from the;\n</script>\n<although theyfollowed by amore powerfulresulted in aUniversity ofHowever, manythe presidentHowever, someis thought tountil the endwas announcedare importantalso includes><input type=the center of DO NOT ALTERused to referthemes/?sort=that had beenthe basis forhas developedin the summercomparativelydescribed thesuch as thosethe resultingis impossiblevarious otherSouth Africanhave the sameeffectivenessin which case; text-align:structure and; background:regarding thesupported theis also knownstyle="marginincluding thebahasa Melayunorsk bokmC%lnorsk nynorskslovenE!D\rinainternacionalcalificaciC3ncomunicaciC3nconstrucciC3n"><div class="disambiguationDomainName\', \'administrationsimultaneouslytransportationInternational margin-bottom:responsibility<![endif]--\x3e\n</><meta name="implementationinfrastructurerepresentationborder-bottom:</head>\n<body>=http%3A%2F%2F<form method="method="post" /favicon.ico" });\n</script>\n.setAttribute(Administration= new Array();<![endif]--\x3e\r\ndisplay:block;Unfortunately,">&nbsp;</div>/favicon.ico">=\'stylesheet\' identification, for example,<li><a href="/an alternativeas a result ofpt"></script>\ntype="submit" \n(function() {recommendationform action="/transformationreconstruction.style.display According to hidden" name="along with thedocument.body.approximately Communicationspost" action="meaning &quot;--<![endif]--\x3ePrime Ministercharacteristic</a> <a class=the history of onmouseover="the governmenthref="https://was originallywas introducedclassificationrepresentativeare considered<![endif]--\x3e\n\ndepends on theUniversity of in contrast to placeholder="in the case ofinternational constitutionalstyle="border-: function() {Because of the-strict.dtd">\n<table class="accompanied byaccount of the<script src="/nature of the the people in in addition tos); js.id = id" width="100%"regarding the Roman Catholican independentfollowing the .gif" width="1the following discriminationarchaeologicalprime minister.js"></script>combination of marginwidth="createElement(w.attachEvent(</a></td></tr>src="https://aIn particular, align="left" Czech RepublicUnited Kingdomcorrespondenceconcluded that.html" title="(function () {comes from theapplication of<span class="sbelieved to beement(\'script\'</a>\n</li>\n<livery different><span class="option value="(also known as\t<li><a href="><input name="separated fromreferred to as valign="top">founder of theattempting to carbon dioxide\n\n<div class="class="search-/body>\n</html>opportunity tocommunications</head>\r\n<body style="width:Tia:?ng Via;tchanges in theborder-color:#0" border="0" </span></div><was discovered" type="text" );\n</script>\n\nDepartment of ecclesiasticalthere has beenresulting from</body></html>has never beenthe first timein response toautomatically </div>\n\n<div iwas consideredpercent of the" /></a></div>collection of descended fromsection of theaccept-charsetto be confusedmember of the padding-right:translation ofinterpretation href=\'http://whether or notThere are alsothere are manya small numberother parts ofimpossible to  class="buttonlocated in the. However, theand eventuallyAt the end of because of itsrepresents the<form action=" method="post"it is possiblemore likely toan increase inhave also beencorresponds toannounced thatalign="right">many countriesfor many yearsearliest knownbecause it waspt"></script>\r valign="top" inhabitants offollowing year\r\n<div class="million peoplecontroversial concerning theargue that thegovernment anda reference totransferred todescribing the style="color:although therebest known forsubmit" name="multiplicationmore than one recognition ofCouncil of theedition of the  <meta name="Entertainment away from the ;margin-right:at the time ofinvestigationsconnected withand many otheralthough it isbeginning with <span class="descendants of<span class="i align="right"</head>\n<body aspects of thehas since beenEuropean Unionreminiscent ofmore difficultVice Presidentcomposition ofpassed throughmore importantfont-size:11pxexplanation ofthe concept ofwritten in the\t<span class="is one of the resemblance toon the groundswhich containsincluding the defined by thepublication ofmeans that theoutside of thesupport of the<input class="<span class="t(Math.random()most prominentdescription ofConstantinoplewere published<div class="seappears in the1" height="1" most importantwhich includeswhich had beendestruction ofthe population\n\t<div class="possibility ofsometimes usedappear to havesuccess of theintended to bepresent in thestyle="clear:b\r\n</script>\r\n<was founded ininterview with_id" content="capital of the\r\n<link rel="srelease of thepoint out thatxMLHttpRequestand subsequentsecond largestvery importantspecificationssurface of theapplied to theforeign policy_setDomainNameestablished inis believed toIn addition tomeaning of theis named afterto protect theis representedDeclaration ofmore efficientClassificationother forms ofhe returned to<span class="cperformance of(function() {\rif and only ifregions of theleading to therelations withUnited Nationsstyle="height:other than theype" content="Association of\n</head>\n<bodylocated on theis referred to(including theconcentrationsthe individualamong the mostthan any other/>\n<link rel=" return false;the purpose ofthe ability to;color:#fff}\n.\n<span class="the subject ofdefinitions of>\r\n<link rel="claim that thehave developed<table width="celebration ofFollowing the to distinguish<span class="btakes place inunder the namenoted that the><![endif]--\x3e\nstyle="margin-instead of theintroduced thethe process ofincreasing thedifferences inestimated thatespecially the/div><div id="was eventuallythroughout histhe differencesomething thatspan></span></significantly ></script>\r\n\r\nenvironmental to prevent thehave been usedespecially forunderstand theis essentiallywere the firstis the largesthave been made" src="http://interpreted assecond half ofcrolling="no" is composed ofII, Holy Romanis expected tohave their owndefined as thetraditionally have differentare often usedto ensure thatagreement withcontaining theare frequentlyinformation onexample is theresulting in a</a></li></ul> class="footerand especiallytype="button" </span></span>which included>\n<meta name="considered thecarried out byHowever, it isbecame part ofin relation topopular in thethe capital ofwas officiallywhich has beenthe History ofalternative todifferent fromto support thesuggested thatin the process  <div class="the foundationbecause of hisconcerned withthe universityopposed to thethe context of<span class="ptext" name="q"\t\t<div class="the scientificrepresented bymathematicianselected by thethat have been><div class="cdiv id="headerin particular,converted into);\n</script>\n<philosophical srpskohrvatskitia:?ng Via;tP QQQP:P8P9Q\0QQQP:P8P9investigaciC3nparticipaciC3nP:P>QP>Q\0Q\vP5P>P1P;P0QQP8P:P>QP>Q\0Q\vP9QP5P;P>P2P5P:QP8QQP5P<Q\vPP>P2P>QQP8P:P>QP>Q\0Q\vQP>P1P;P0QQQ\fP2Q\0P5P<P5P=P8P:P>QP>Q\0P0QQP5P3P>P4P=QQP:P0QP0QQ\fP=P>P2P>QQP8P#P:Q\0P0P8P=Q\vP2P>P?Q\0P>QQ\vP:P>QP>Q\0P>P9QP4P5P;P0QQ\fP?P>P<P>Q\tQ\fQQQ\0P5P4QQP2P>P1Q\0P0P7P>P<QQP>Q\0P>P=Q\vQQP0QQP8P5QP5QP5P=P8P5PP;P0P2P=P0QP8QQP>Q\0P8P8QP8QQP5P<P0Q\0P5Q\bP5P=P8QP!P:P0QP0QQ\fP?P>Q\rQP>P<QQP;P5P4QP5QQP:P0P7P0QQ\fQP>P2P0Q\0P>P2P:P>P=P5QP=P>Q\0P5Q\bP5P=P8P5P:P>QP>Q\0P>P5P>Q\0P3P0P=P>P2P:P>QP>Q\0P>P<P P5P:P;P0P<P0X\'YYYX*X/Y\tYYX*X/Y\nX\'X*X\'YYY\bX6Y\bX9X\'YX(X1X\'YX,X\'YYY\bX\'YX9X\'YX1X3X\'X&YYX4X\'X1YX\'X*X\'YX#X9X6X\'X!X\'YX1Y\nX\'X6X)X\'YX*X5YY\nYX\'YX\'X9X6X\'X!X\'YYX*X\'X&X,X\'YX#YX9X\'X(X\'YX*X3X,Y\nYX\'YX#YX3X\'YX\'YX6X:X7X\'X*X\'YYY\nX/Y\nY\bX\'YX*X1X-Y\nX(X\'YX,X/Y\nX/X)X\'YX*X9YY\nYX\'YX#X.X(X\'X1X\'YX\'YYX\'YX\'YX#YYX\'YX\'YX*X\'X1Y\nX.X\'YX*YYY\nX)X\'YX\'YX9X\'X(X\'YX.Y\bX\'X7X1X\'YYX,X*YX9X\'YX/Y\nYY\bX1X\'YX3Y\nX\'X-X)X9X(X/X\'YYYX\'YX*X1X(Y\nX)X\'YX1Y\bX\'X(X7X\'YX#X/X(Y\nX)X\'YX\'X.X(X\'X1X\'YYX*X-X/X)X\'YX\'X:X\'YY\ncursor:pointer;</title>\n<meta " href="http://"><span class="members of the window.locationvertical-align:/a> | <a href="<!doctype html>media="screen" <option value="favicon.ico" />\n\t\t<div class="characteristics" method="get" /body>\n</html>\nshortcut icon" document.write(padding-bottom:representativessubmit" value="align="center" throughout the science fiction\n  <div class="submit" class="one of the most valign="top"><was established);\r\n</script>\r\nreturn false;">).style.displaybecause of the document.cookie<form action="/}body{margin:0;Encyclopedia ofversion of the .createElement(name" content="</div>\n</div>\n\nadministrative </body>\n</html>history of the "><input type="portion of the as part of the &nbsp;<a href="other countries">\n<div class="</span></span><In other words,display: block;control of the introduction of/>\n<meta name="as well as the in recent years\r\n\t<div class="</div>\n\t</div>\ninspired by thethe end of the compatible withbecame known as style="margin:.js"></script>< International there have beenGerman language style="color:#Communist Partyconsistent withborder="0" cell marginheight="the majority of" align="centerrelated to the many different Orthodox Churchsimilar to the />\n<link rel="swas one of the until his death})();\n</script>other languagescompared to theportions of thethe Netherlandsthe most commonbackground:url(argued that thescrolling="no" included in theNorth American the name of theinterpretationsthe traditionaldevelopment of frequently useda collection ofvery similar tosurrounding theexample of thisalign="center">would have beenimage_caption =attached to thesuggesting thatin the form of involved in theis derived fromnamed after theIntroduction torestrictions on style="width: can be used to the creation ofmost important information andresulted in thecollapse of theThis means thatelements of thewas replaced byanalysis of theinspiration forregarded as themost successfulknown as &quot;a comprehensiveHistory of the were consideredreturned to theare referred toUnsourced image>\n\t<div class="consists of thestopPropagationinterest in theavailability ofappears to haveelectromagneticenableServices(function of theIt is important</script></div>function(){var relative to theas a result of the position ofFor example, in method="post" was followed by&amp;mdash; thethe applicationjs"></script>\r\nul></div></div>after the deathwith respect tostyle="padding:is particularlydisplay:inline; type="submit" is divided intod8-f (g.\0d=)responsabilidadadministraciC3ninternacionalescorrespondiente`$\t`$*`$/`%\v`$`$*`%`$0`%\r`$5`$9`$.`$>`$0`%`$2`%\v`$`%\v`$`$`%`$(`$>`$5`$2`%`$`$?`$(`$8`$0`$`$>`$0`$*`%`$2`$?`$8`$`%\v`$`%`$`$`$>`$9`$?`$`$-`%`$`%`$`$6`$>`$.`$?`$2`$9`$.`$>`$0`%\0`$`$>`$`$0`$#`$,`$(`$>`$(`%`$`%`$.`$>`$0`$,`%\r`$2`%\t`$`$.`$>`$2`$?`$`$.`$9`$?`$2`$>`$*`%`$7`%\r`$ `$,`$"`$<`$$`%`$-`$>`$`$*`$>`$`%\r`$2`$?`$`$`%\r`$0`%`$(`$`$?`$2`$>`$+`$&`%\f`$0`$>`$(`$.`$>`$.`$2`%`$.`$$`$&`$>`$(`$,`$>`$`$>`$0`$5`$?`$`$>`$8`$`%\r`$/`%\v`$`$`$>`$9`$$`%`$*`$9`%`$`$`$,`$$`$>`$/`$>`$8`$`$5`$>`$&`$&`%`$`$(`%`$*`$?`$`$2`%`$5`$?`$6`%`$7`$0`$>`$`%\r`$/`$\t`$$`%\r`$$`$0`$.`%`$`$,`$\b`$&`%\v`$(`%\v`$`$\t`$*`$`$0`$#`$*`$"`$<`%`$`$8`%\r`$%`$?`$$`$+`$?`$2`%\r`$.`$.`%`$`%\r`$/`$`$`%\r`$`$>`$`%`$`$$`%\0`$8`$`$`%\0`$$`$`$>`$`$`$>`$5`$?`$-`$>`$`$`$#`%\r`$`%`$&`%`$8`$0`%`$&`$?`$(`%\v`$`$9`$$`%\r`$/`$>`$8`%`$`%\r`$8`$`$>`$`$\'`%\0`$5`$?`$6`%\r`$5`$0`$>`$$`%`$`$&`%\b`$`%\r`$8`$(`$`%\r`$6`$>`$8`$>`$.`$(`%`$`$&`$>`$2`$$`$,`$?`$`$2`%\0`$*`%`$0`%`$7`$9`$?`$`$&`%\0`$.`$?`$$`%\r`$0`$`$5`$?`$$`$>`$0`%`$*`$/`%`$8`%\r`$%`$>`$(`$`$0`%\v`$!`$<`$.`%`$`%\r`$$`$/`%\v`$`$(`$>`$`%`$*`$/`$>`$*`%\v`$8`%\r`$`$`$0`%`$2`%`$`$>`$0`%\r`$/`$5`$?`$`$>`$0`$8`%`$`$(`$>`$.`%`$2`%\r`$/`$&`%`$`%`$`$9`$.`%`$6`$>`$8`%\r`$`%`$2`$.`%\b`$`$(`%`$$`%\b`$/`$>`$0`$`$?`$8`$`%rss+xml" title="-type" content="title" content="at the same time.js"></script>\n<" method="post" </span></a></li>vertical-align:t/jquery.min.js">.click(function( style="padding-})();\n</script>\n</span><a href="<a href="http://); return false;text-decoration: scrolling="no" border-collapse:associated with Bahasa IndonesiaEnglish language<text xml:space=.gif" border="0"</body>\n</html>\noverflow:hidden;img src="http://addEventListenerresponsible for s.js"></script>\n/favicon.ico" />operating system" style="width:1target="_blank">State Universitytext-align:left;\ndocument.write(, including the around the world);\r\n</script>\r\n<" style="height:;overflow:hiddenmore informationan internationala member of the one of the firstcan be found in </div>\n\t\t</div>\ndisplay: none;">" />\n<link rel="\n  (function() {the 15th century.preventDefault(large number of Byzantine Empire.jpg|thumb|left|vast majority ofmajority of the  align="center">University Pressdominated by theSecond World Wardistribution of style="position:the rest of the characterized by rel="nofollow">derives from therather than the a combination ofstyle="width:100English-speakingcomputer scienceborder="0" alt="the existence ofDemocratic Party" style="margin-For this reason,.js"></script>\n\tsByTagName(s)[0]js"></script>\r\n<.js"></script>\r\nlink rel="icon" \' alt=\'\' class=\'formation of theversions of the </a></div></div>/page>\n  <page>\n<div class="contbecame the firstbahasa Indonesiaenglish (simple)NN;N;N7N=N9N:N,QQ\0P2P0QQP:P8P:P>P<P?P0P=P8P8QP2P;QP5QQQPP>P1P0P2P8QQ\fQP5P;P>P2P5P:P0Q\0P0P7P2P8QP8QPP=QP5Q\0P=P5QPQP2P5QP8QQ\fP=P0P?Q\0P8P<P5Q\0P8P=QP5Q\0P=P5QP:P>QP>Q\0P>P3P>QQQ\0P0P=P8QQ\vP:P0QP5QQP2P5QQP;P>P2P8QQP?Q\0P>P1P;P5P<Q\vP?P>P;QQP8QQ\fQP2P;QQQQQP=P0P8P1P>P;P5P5P:P>P<P?P0P=P8QP2P=P8P<P0P=P8P5QQ\0P5P4QQP2P0X\'YYY\bX\'X6Y\nX9X\'YX1X&Y\nX3Y\nX)X\'YX\'YX*YX\'YYX4X\'X1YX\'X*YX\'YX3Y\nX\'X1X\'X*X\'YYYX*Y\bX(X)X\'YX3X9Y\bX/Y\nX)X\'X-X5X\'X&Y\nX\'X*X\'YX9X\'YYY\nX)X\'YX5Y\bX*Y\nX\'X*X\'YX\'YX*X1YX*X\'YX*X5X\'YY\nYX\'YX%X3YX\'YY\nX\'YYX4X\'X1YX)X\'YYX1X&Y\nX\'X*robots" content="<div id="footer">the United States<img src="http://.jpg|right|thumb|.js"></script>\r\n<location.protocolframeborder="0" s" />\n<meta name="</a></div></div><font-weight:bold;&quot; and &quot;depending on the margin:0;padding:" rel="nofollow" President of the twentieth centuryevision>\n  </pageInternet Explorera.async = true;\r\ninformation about<div id="header">" action="http://<a href="https://<div id="content"</div>\r\n</div>\r\n<derived from the <img src=\'http://according to the \n</body>\n</html>\nstyle="font-size:script language="Arial, Helvetica,</a><span class="</script><script political partiestd></tr></table><href="http://www.interpretation ofrel="stylesheet" document.write(\'<charset="utf-8">\nbeginning of the revealed that thetelevision series" rel="nofollow"> target="_blank">claiming that thehttp%3A%2F%2Fwww.manifestations ofPrime Minister ofinfluenced by theclass="clearfix">/div>\r\n</div>\r\n\r\nthree-dimensionalChurch of Englandof North Carolinasquare kilometres.addEventListenerdistinct from thecommonly known asPhonetic Alphabetdeclared that thecontrolled by theBenjamin Franklinrole-playing gamethe University ofin Western Europepersonal computerProject Gutenbergregardless of thehas been proposedtogether with the></li><li class="in some countriesmin.js"></script>of the populationofficial language<img src="images/identified by thenatural resourcesclassification ofcan be consideredquantum mechanicsNevertheless, themillion years ago</body>\r\n</html>\rNN;N;N7N=N9N:N,\ntake advantage ofand, according toattributed to theMicrosoft Windowsthe first centuryunder the controldiv class="headershortly after thenotable exceptiontens of thousandsseveral differentaround the world.reaching militaryisolated from theopposition to thethe Old TestamentAfrican Americansinserted into theseparate from themetropolitan areamakes it possibleacknowledged thatarguably the mosttype="text/css">\nthe InternationalAccording to the pe="text/css" />\ncoincide with thetwo-thirds of theDuring this time,during the periodannounced that hethe internationaland more recentlybelieved that theconsciousness andformerly known assurrounded by thefirst appeared inoccasionally usedposition:absolute;" target="_blank" position:relative;text-align:center;jax/libs/jquery/1.background-color:#type="application/anguage" content="<meta http-equiv="Privacy Policy</a>e("%3Cscript src=\'" target="_blank">On the other hand,.jpg|thumb|right|2</div><div class="<div style="float:nineteenth century</body>\r\n</html>\r\n<img src="http://s;text-align:centerfont-weight: bold; According to the difference between" frameborder="0" " style="position:link href="http://html4/loose.dtd">\nduring this period</td></tr></table>closely related tofor the first time;font-weight:bold;input type="text" <span style="font-onreadystatechange\t<div class="cleardocument.location. For example, the a wide variety of <!DOCTYPE html>\r\n<&nbsp;&nbsp;&nbsp;"><a href="http://style="float:left;concerned with the=http%3A%2F%2Fwww.in popular culturetype="text/css" />it is possible to Harvard Universitytylesheet" href="/the main characterOxford University  name="keywords" cstyle="text-align:the United Kingdomfederal government<div style="margin depending on the description of the<div class="header.min.js"></script>destruction of theslightly differentin accordance withtelecommunicationsindicates that theshortly thereafterespecially in the European countriesHowever, there aresrc="http://staticsuggested that the" src="http://www.a large number of Telecommunications" rel="nofollow" tHoly Roman Emperoralmost exclusively" border="0" alt="Secretary of Stateculminating in theCIA World Factbookthe most importantanniversary of thestyle="background-<li><em><a href="/the Atlantic Oceanstrictly speaking,shortly before thedifferent types ofthe Ottoman Empire><img src="http://An Introduction toconsequence of thedeparture from theConfederate Statesindigenous peoplesProceedings of theinformation on thetheories have beeninvolvement in thedivided into threeadjacent countriesis responsible fordissolution of thecollaboration withwidely regarded ashis contemporariesfounding member ofDominican Republicgenerally acceptedthe possibility ofare also availableunder constructionrestoration of thethe general publicis almost entirelypasses through thehas been suggestedcomputer and videoGermanic languages according to the different from theshortly afterwardshref="https://www.recent developmentBoard of Directors<div class="search| <a href="http://In particular, theMultiple footnotesor other substancethousands of yearstranslation of the</div>\r\n</div>\r\n\r\n<a href="index.phpwas established inmin.js"></script>\nparticipate in thea strong influencestyle="margin-top:represented by thegraduated from theTraditionally, theElement("script");However, since the/div>\n</div>\n<div left; margin-left:protection against0; vertical-align:Unfortunately, thetype="image/x-icon/div>\n<div class=" class="clearfix"><div class="footer\t\t</div>\n\t\t</div>\nthe motion picturePQ\nP;P3P0Q\0QP:P8P1Q\nP;P3P0Q\0QP:P8P$P5P4P5Q\0P0QP8P8P=P5QP:P>P;Q\fP:P>QP>P>P1Q\tP5P=P8P5QP>P>P1Q\tP5P=P8QP?Q\0P>P3Q\0P0P<P<Q\vPQP?Q\0P0P2P8QQ\fP1P5QP?P;P0QP=P>P<P0QP5Q\0P8P0P;Q\vP?P>P7P2P>P;QP5QP?P>QP;P5P4P=P8P5Q\0P0P7P;P8QP=Q\vQP?Q\0P>P4QP:QP8P8P?Q\0P>P3Q\0P0P<P<P0P?P>P;P=P>QQQ\fQP=P0QP>P4P8QQQP8P7P1Q\0P0P=P=P>P5P=P0QP5P;P5P=P8QP8P7P<P5P=P5P=P8QP:P0QP5P3P>Q\0P8P8PP;P5P:QP0P=P4Q\0`$&`%\r`$5`$>`$0`$>`$.`%\b`$(`%`$`$2`$*`%\r`$0`$&`$>`$(`$-`$>`$0`$$`%\0`$/`$`$(`%`$&`%`$6`$9`$?`$(`%\r`$&`%\0`$`$`$!`$?`$/`$>`$&`$?`$2`%\r`$2`%\0`$`$\'`$?`$`$>`$0`$5`%\0`$!`$?`$/`%\v`$`$?`$`%\r`$ `%`$8`$.`$>`$`$>`$0`$`$`$`%\r`$6`$(`$&`%`$(`$?`$/`$>`$*`%\r`$0`$/`%\v`$`$`$(`%`$8`$>`$0`$`$(`$2`$>`$`$(`$*`$>`$0`%\r`$`%\0`$6`$0`%\r`$$`%\v`$`$2`%\v`$`$8`$-`$>`$+`$<`%\r`$2`%\b`$6`$6`$0`%\r`$$`%`$`$*`%\r`$0`$&`%`$6`$*`%\r`$2`%`$/`$0`$`%`$`$&`%\r`$0`$8`%\r`$%`$?`$$`$?`$\t`$$`%\r`$*`$>`$&`$\t`$(`%\r`$9`%`$`$`$?`$`%\r`$ `$>`$/`$>`$$`%\r`$0`$>`$`%\r`$/`$>`$&`$>`$*`%`$0`$>`$(`%`$`%\v`$!`$<`%`$`$`$(`%`$5`$>`$&`$6`%\r`$0`%`$#`%\0`$6`$?`$`%\r`$7`$>`$8`$0`$`$>`$0`%\0`$8`$`$`%\r`$0`$9`$*`$0`$?`$#`$>`$.`$,`%\r`$0`$>`$`$!`$,`$`%\r`$`%\v`$`$\t`$*`$2`$,`%\r`$\'`$.`$`$$`%\r`$0`%\0`$8`$`$*`$0`%\r`$`$\t`$.`%\r`$.`%\0`$&`$.`$>`$\'`%\r`$/`$.`$8`$9`$>`$/`$$`$>`$6`$,`%\r`$&`%\v`$`$.`%\0`$!`$?`$/`$>`$`$\b`$*`%\0`$`$2`$.`%\v`$,`$>`$`$2`$8`$`$`%\r`$/`$>`$`$*`$0`%`$6`$(`$`$(`%`$,`$`$\'`$,`$>`$`$<`$>`$0`$(`$5`%\0`$(`$$`$.`$*`%\r`$0`$.`%`$`$*`%\r`$0`$6`%\r`$(`$*`$0`$?`$5`$>`$0`$(`%`$`$8`$>`$(`$8`$.`$0`%\r`$%`$(`$`$/`%\v`$`$?`$$`$8`%\v`$.`$5`$>`$0X\'YYX4X\'X1YX\'X*X\'YYYX*X/Y\nX\'X*X\'YYYX(Y\nY\bX*X1X\'YYX4X\'YX/X\'X*X9X/X/X\'YX2Y\bX\'X1X9X/X/X\'YX1X/Y\bX/X\'YX%X3YX\'YY\nX)X\'YYY\bX*Y\bX4Y\bX(X\'YYX3X\'X(YX\'X*X\'YYX9YY\bYX\'X*X\'YYX3YX3YX\'X*X\'YX,X1X\'YY\nYX3X\'YX\'X3YX\'YY\nX)X\'YX\'X*X5X\'YX\'X*keywords" content="w3.org/1999/xhtml"><a target="_blank" text/html; charset=" target="_blank"><table cellpadding="autocomplete="off" text-align: center;to last version by background-color: #" href="http://www./div></div><div id=<a href="#" class=""><img src="http://cript" src="http://\n<script language="//EN" "http://www.wencodeURIComponent(" href="javascript:<div class="contentdocument.write(\'<scposition: absolute;script src="http:// style="margin-top:.min.js"></script>\n</div>\n<div class="w3.org/1999/xhtml" \n\r\n</body>\r\n</html>distinction between/" target="_blank"><link href="http://encoding="utf-8"?>\nw.addEventListener?action="http://www.icon" href="http:// style="background:type="text/css" />\nmeta property="og:t<input type="text"  style="text-align:the development of tylesheet" type="tehtml; charset=utf-8is considered to betable width="100%" In addition to the contributed to the differences betweendevelopment of the It is important to </script>\n\n<script  style="font-size:1></span><span id=gbLibrary of Congress<img src="http://imEnglish translationAcademy of Sciencesdiv style="display:construction of the.getElementById(id)in conjunction withElement(\'script\'); <meta property="og:PQ\nP;P3P0Q\0QP:P8\n type="text" name=">Privacy Policy</a>administered by theenableSingleRequeststyle=&quot;margin:</div></div></div><><img src="http://i style=&quot;float:referred to as the total population ofin Washington, D.C. style="background-among other things,organization of theparticipated in thethe introduction ofidentified with thefictional character Oxford University misunderstanding ofThere are, however,stylesheet" href="/Columbia Universityexpanded to includeusually referred toindicating that thehave suggested thataffiliated with thecorrelation betweennumber of different></td></tr></table>Republic of Ireland\n</script>\n<script under the influencecontribution to theOfficial website ofheadquarters of thecentered around theimplications of thehave been developedFederal Republic ofbecame increasinglycontinuation of theNote, however, thatsimilar to that of capabilities of theaccordance with theparticipants in thefurther developmentunder the directionis often consideredhis younger brother</td></tr></table><a http-equiv="X-UA-physical propertiesof British Columbiahas been criticized(with the exceptionquestions about thepassing through the0" cellpadding="0" thousands of peopleredirects here. Forhave children under%3E%3C/script%3E"));<a href="http://www.<li><a href="http://site_name" content="text-decoration:nonestyle="display: none<meta http-equiv="X-new Date().getTime() type="image/x-icon"</span><span class="language="javascriptwindow.location.href<a href="javascript:--\x3e\r\n<script type="t<a href=\'http://www.hortcut icon" href="</div>\r\n<div class="<script src="http://" rel="stylesheet" t</div>\n<script type=/a> <a href="http:// allowTransparency="X-UA-Compatible" conrelationship between\n</script>\r\n<script </a></li></ul></div>associated with the programming language</a><a href="http://</a></li><li class="form action="http://<div style="display:type="text" name="q"<table width="100%" background-position:" border="0" width="rel="shortcut icon" h6><ul><li><a href="  <meta http-equiv="css" media="screen" responsible for the " type="application/" style="background-html; charset=utf-8" allowtransparency="stylesheet" type="te\r\n<meta http-equiv="></span><span class="0" cellspacing="0">;\n</script>\n<script sometimes called thedoes not necessarilyFor more informationat the beginning of <!DOCTYPE html><htmlparticularly in the type="hidden" name="javascript:void(0);"effectiveness of the autocomplete="off" generally considered><input type="text" "></script>\r\n<scriptthroughout the worldcommon misconceptionassociation with the</div>\n</div>\n<div cduring his lifetime,corresponding to thetype="image/x-icon" an increasing numberdiplomatic relationsare often consideredmeta charset="utf-8" <input type="text" examples include the"><img src="http://iparticipation in thethe establishment of\n</div>\n<div class="&amp;nbsp;&amp;nbsp;to determine whetherquite different frommarked the beginningdistance between thecontributions to theconflict between thewidely considered towas one of the firstwith varying degreeshave speculated that(document.getElementparticipating in theoriginally developedeta charset="utf-8"> type="text/css" />\ninterchangeably withmore closely relatedsocial and politicalthat would otherwiseperpendicular to thestyle type="text/csstype="submit" name="families residing indeveloping countriescomputer programmingeconomic developmentdetermination of thefor more informationon several occasionsportuguC*s (Europeu)P#P:Q\0P0QP=QQ\fP:P0QP:Q\0P0QP=QQ\fP:P0P P>QQP8P9QP:P>P9P<P0QP5Q\0P8P0P;P>P2P8P=QP>Q\0P<P0QP8P8QP?Q\0P0P2P;P5P=P8QP=P5P>P1QP>P4P8P<P>P8P=QP>Q\0P<P0QP8QPP=QP>Q\0P<P0QP8QP P5QP?QP1P;P8P:P8P:P>P;P8QP5QQP2P>P8P=QP>Q\0P<P0QP8QQP5Q\0Q\0P8QP>Q\0P8P8P4P>QQP0QP>QP=P>X\'YYX*Y\bX\'X,X/Y\bYX\'YX\'X4X*X1X\'YX\'X*X\'YX\'YX*X1X\'X-X\'X*html; charset=UTF-8" setTimeout(function()display:inline-block;<input type="submit" type = \'text/javascri<img src="http://www." "http://www.w3.org/shortcut icon" href="" autocomplete="off" </a></div><div class=</a></li>\n<li class="css" type="text/css" <form action="http://xt/css" href="http://link rel="alternate" \r\n<script type="text/ onclick="javascript:(new Date).getTime()}height="1" width="1" People\'s Republic of  <a href="http://www.text-decoration:underthe beginning of the </div>\n</div>\n</div>\nestablishment of the </div></div></div></d#viewport{min-height:\n<script src="http://option><option value=often referred to as /option>\n<option valu<!DOCTYPE html>\n\x3c!--[International Airport>\n<a href="http://www</a><a href="http://w`8 `82`8)`82`9`8`8"a%aa aa#aaf-#i+d8-f (g9i+)`$(`$?`$0`%\r`$&`%`$6`$!`$>`$\t`$(`$2`%\v`$!`$`%\r`$7`%`$$`%\r`$0`$`$>`$(`$`$>`$0`%\0`$8`$`$,`$`$\'`$?`$$`$8`%\r`$%`$>`$*`$(`$>`$8`%\r`$5`%\0`$`$>`$0`$8`$`$8`%\r`$`$0`$#`$8`$>`$.`$`%\r`$0`%\0`$`$?`$`%\r`$ `%\v`$`$5`$?`$`%\r`$`$>`$(`$`$.`%`$0`$?`$`$>`$5`$?`$-`$?`$(`%\r`$(`$`$>`$!`$?`$/`$>`$`$`%\r`$/`%\v`$`$`$?`$8`%`$0`$`%\r`$7`$>`$*`$9`%`$`$`$$`%\0`$*`%\r`$0`$,`$`$\'`$(`$`$?`$*`%\r`$*`$#`%\0`$`%\r`$0`$?`$`%`$`$*`%\r`$0`$>`$0`$`$-`$*`%\r`$0`$>`$*`%\r`$$`$.`$>`$2`$?`$`%\v`$`$0`$+`$<`%\r`$$`$>`$0`$(`$?`$0`%\r`$.`$>`$#`$2`$?`$.`$?`$`%`$!description" content="document.location.prot.getElementsByTagName(<!DOCTYPE html>\n<html <meta charset="utf-8">:url" content="http://.css" rel="stylesheet"style type="text/css">type="text/css" href="w3.org/1999/xhtml" xmltype="text/javascript" method="get" action="link rel="stylesheet"  = document.getElementtype="image/x-icon" />cellpadding="0" cellsp.css" type="text/css" </a></li><li><a href="" width="1" height="1""><a href="http://www.style="display:none;">alternate" type="appli-//W3C//DTD XHTML 1.0 ellspacing="0" cellpad type="hidden" value="/a>&nbsp;<span role="s\n<input type="hidden" language="JavaScript"  document.getElementsBg="0" cellspacing="0" ype="text/css" media="type=\'text/javascript\'with the exception of ype="text/css" rel="st height="1" width="1" =\'+encodeURIComponent(<link rel="alternate" \nbody, tr, input, textmeta name="robots" conmethod="post" action=">\n<a href="http://www.css" rel="stylesheet" </div></div><div classlanguage="javascript">aria-hidden="true">B7<ript" type="text/javasl=0;})();\n(function(){background-image: url(/a></li><li><a href="h\t\t<li><a href="http://ator" aria-hidden="tru> <a href="http://www.language="javascript" /option>\n<option value/div></div><div class=rator" aria-hidden="tre=(new Date).getTime()portuguC*s (do Brasil)P>Q\0P3P0P=P8P7P0QP8P8P2P>P7P<P>P6P=P>QQQ\fP>P1Q\0P0P7P>P2P0P=P8QQ\0P5P3P8QQQ\0P0QP8P8P2P>P7P<P>P6P=P>QQP8P>P1QP7P0QP5P;Q\fP=P0<!DOCTYPE html PUBLIC "nt-Type" content="text/<meta http-equiv="Conteransitional//EN" "http:<html xmlns="http://www-//W3C//DTD XHTML 1.0 TDTD/xhtml1-transitional//www.w3.org/TR/xhtml1/pe = \'text/javascript\';<meta name="descriptionparentNode.insertBefore<input type="hidden" najs" type="text/javascri(document).ready(functiscript type="text/javasimage" content="http://UA-Compatible" content=tml; charset=utf-8" />\nlink rel="shortcut icon<link rel="stylesheet" </script>\n<script type== document.createElemen<a target="_blank" href= document.getElementsBinput type="text" name=a.type = \'text/javascrinput type="hidden" namehtml; charset=utf-8" />dtd">\n<html xmlns="http-//W3C//DTD HTML 4.01 TentsByTagName(\'script\')input type="hidden" nam<script type="text/javas" style="display:none;">document.getElementById(=document.createElement(\' type=\'text/javascript\'input type="text" name="d.getElementsByTagName(snical" href="http://www.C//DTD HTML 4.01 Transit<style type="text/css">\n\n<style type="text/css">ional.dtd">\n<html xmlns=http-equiv="Content-Typeding="0" cellspacing="0"html; charset=utf-8" />\n style="display:none;"><<li><a href="http://www. type=\'text/javascript\'>P4P5QQP5P;Q\fP=P>QQP8QP>P>QP2P5QQQP2P8P8P?Q\0P>P8P7P2P>P4QQP2P0P1P5P7P>P?P0QP=P>QQP8`$*`%`$8`%\r`$$`$?`$`$>`$`$>`$`$`%\r`$0`%`$8`$\t`$(`%\r`$9`%\v`$`$(`%`$5`$?`$\'`$>`$(`$8`$-`$>`$+`$?`$`%\r`$8`$?`$`$`$8`%`$0`$`%\r`$7`$?`$$`$`%\t`$*`%\0`$0`$>`$`$`$5`$?`$`%\r`$`$>`$*`$(`$`$>`$0`%\r`$0`$5`$>`$\b`$8`$`%\r`$0`$?`$/`$$`$>',
      "۷%ƌ'T%'W%×%O%g%¦&Ɠ%ǥ&>&*&'&^&Ÿా&ƭ&ƒ&)&^&%&'&&P&1&±&3&]&m&u&E&t&C&Ï&V&V&/&>&6&ྲྀ᝼o&p&@&E&M&P&x&@&F&e&Ì&7&:&(&D&0&C&)&.&F&-&1&(&L&F&1ɞ*Ϫ⇳&፲&K&;&)&E&H&P&0&?&9&V&&-&v&a&,&E&)&?&=&'&'&B&മ&ԃ&̖*&*8&%&%&&&%,)&&>&&7&]&F&2&>&J&6&n&2&%&?&&2&6&J&g&-&0&,&*&J&*&O&)&6&(&<&B&N&.&P&@&2&.&W&M&%Լ(,(<&,&Ϛ&ᣇ&-&,(%&(&%&(Ļ0&X&D&&j&'&J&(&.&B&3&Z&R&h&3&E&E&<Æ-͠ỳ&%8?&@&,&Z&@&0&J&,&^&x&_&6&C&6&Cܬ⨥&f&-&-&-&-&,&J&2&8&z&8&C&Y&8&-&d&ṸÌ-&7&1&F&7&t&W&7&I&.&.&^&=ྜ᧓&8(>&/&/&ݻ')'ၥ')'%@/&0&%оী*&*@&CԽהɴ׫4෗ܚӑ6඄&/Ÿ̃Z&*%ɆϿ&Ĵ&1¨ҴŴ"
    );
    flipBuffer(dictionary);
    DICTIONARY_DATA = dictionary;
  }
  function min(a, b) {
    return a <= b ? a : b;
  }
  function readInput(src, dst, offset, length) {
    if (src == null) return -1;
    var end = min(src.offset + length, src.data.length);
    var bytesRead = end - src.offset;
    dst.set(src.data.subarray(src.offset, end), offset);
    src.offset += bytesRead;
    return bytesRead;
  }
  function closeInput(src) {
    return 0;
  }
  function flipBuffer(buffer) {}
  function toUsAsciiBytes(src) {
    var n = src.length;
    var result = new Int8Array(n);
    for (var i = 0; i < n; ++i) {
      result[i] = src.charCodeAt(i);
    }
    return result;
  }
  function decode(bytes) {
    var s = new State();
    initState(s, new InputStream(bytes));
    var totalOutput = 0;
    var chunks = [];
    while (true) {
      var chunk = new Int8Array(16384);
      chunks.push(chunk);
      s.output = chunk;
      s.outputOffset = 0;
      s.outputLength = 16384;
      s.outputUsed = 0;
      decompress(s);
      totalOutput += s.outputUsed;
      if (s.outputUsed < 16384) break;
    }
    close(s);
    var result = new Int8Array(totalOutput);
    var offset = 0;
    for (var i = 0; i < chunks.length; ++i) {
      var chunk = chunks[i];
      var end = min(totalOutput, offset + 16384);
      var len = end - offset;
      if (len < 16384) {
        result.set(chunk.subarray(0, len), offset);
      } else {
        result.set(chunk, offset);
      }
      offset += len;
    }
    return result;
  }
  return decode;
}
var BrotliDecode = BrotliDecodeClosure();
Module['BrotliDecode'] = BrotliDecode;
var moduleOverrides = Object.assign({}, Module);
var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
var ENVIRONMENT_IS_NODE =
  typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}
var read_, readAsync, readBinary, setWindowTitle;
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) {
    scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1);
  } else {
    scriptDirectory = '';
  }
  {
    read_ = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    };
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = (url) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      };
    }
    readAsync = (url, onload, onerror) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
          onload(xhr.response);
          return;
        }
        onerror();
      };
      xhr.onerror = onerror;
      xhr.send(null);
    };
  }
  setWindowTitle = (title) => (document.title = title);
} else {
}
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
if (Module['arguments']) arguments_ = Module['arguments'];
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (Module['quit']) quit_ = Module['quit'];
function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}
var tempRet0 = 0;
var setTempRet0 = (value) => {
  tempRet0 = value;
};
var getTempRet0 = () => tempRet0;
var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime = Module['noExitRuntime'] || true;
if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}
var wasmMemory;
var ABORT = false;
var EXITSTATUS;
function assert(condition, text) {
  if (!condition) {
    abort(text);
  }
}
function getCFunc(ident) {
  var func = Module['_' + ident];
  return func;
}
function ccall(ident, returnType, argTypes, args, opts) {
  var toC = {
    string: function (str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    array: function (arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
  };
  function convertReturnValue(ret) {
    if (returnType === 'string') {
      return UTF8ToString(ret);
    }
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }
  ret = onDone(ret);
  return ret;
}
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  var numericArgs = argTypes.every(function (type) {
    return type === 'number';
  });
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function () {
    return ccall(ident, returnType, argTypes, arguments, opts);
  };
}
var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  } else {
    var str = '';
    while (idx < endPtr) {
      var u0 = heapOrArray[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = heapOrArray[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = heapOrArray[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
  }
  return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | (u >> 6);
      heap[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | (u >> 12);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 240 | (u >> 18);
      heap[outIdx++] = 128 | ((u >> 12) & 63);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    }
  }
  heap[outIdx] = 0;
  return outIdx - startIdx;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
    if (u <= 127) ++len;
    else if (u <= 2047) len += 2;
    else if (u <= 65535) len += 3;
    else len += 4;
  }
  return len;
}
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}
var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;
var wasmTable;
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
function keepRuntimeAlive() {
  return noExitRuntime;
}
function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
  runtimeInitialized = true;
  if (!Module['noFSInit'] && !FS.init.initialized) FS.init();
  FS.ignorePermissions = false;
  TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function postRun() {
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
  return id;
}
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }
  what = 'Aborted(' + what + ')';
  err(what);
  ABORT = true;
  EXITSTATUS = 1;
  what += '. Build with -sASSERTIONS for more info.';
  var e = new WebAssembly.RuntimeError(what);
  throw e;
}
var dataURIPrefix = 'data:application/octet-stream;base64,';
function isDataURI(filename) {
  return filename.startsWith(dataURIPrefix);
}
function isFileURI(filename) {
  return filename.startsWith('file://');
}
var wasmBinaryFile;
wasmBinaryFile = 'subtitles-octopus-worker.wasm';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}
function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw 'both async and sync fetching of the wasm failed';
    }
  } catch (err) {
    abort(err);
  }
}
function getBinaryPromise() {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function' && !isFileURI(wasmBinaryFile)) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' })
        .then(function (response) {
          if (!response['ok']) {
            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
          }
          return response['arrayBuffer']();
        })
        .catch(function () {
          return getBinary(wasmBinaryFile);
        });
    } else {
      if (readAsync) {
        return new Promise(function (resolve, reject) {
          readAsync(
            wasmBinaryFile,
            function (response) {
              resolve(new Uint8Array(response));
            },
            reject
          );
        });
      }
    }
  }
  return Promise.resolve().then(function () {
    return getBinary(wasmBinaryFile);
  });
}
function createWasm() {
  var info = { a: asmLibraryArg };
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module['asm'] = exports;
    wasmMemory = Module['asm']['N'];
    updateGlobalBufferAndViews(wasmMemory.buffer);
    wasmTable = Module['asm']['_d'];
    addOnInit(Module['asm']['O']);
    removeRunDependency('wasm-instantiate');
  }
  addRunDependency('wasm-instantiate');
  function receiveInstantiationResult(result) {
    receiveInstance(result['instance']);
  }
  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
      })
      .then(function (instance) {
        return instance;
      })
      .then(receiver, function (reason) {
        err('failed to asynchronously prepare wasm: ' + reason);
        abort(reason);
      });
  }
  function instantiateAsync() {
    if (
      !wasmBinary &&
      typeof WebAssembly.instantiateStreaming == 'function' &&
      !isDataURI(wasmBinaryFile) &&
      !isFileURI(wasmBinaryFile) &&
      typeof fetch == 'function'
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info);
        return result.then(receiveInstantiationResult, function (reason) {
          err('wasm streaming compile failed: ' + reason);
          err('falling back to ArrayBuffer instantiation');
          return instantiateArrayBuffer(receiveInstantiationResult);
        });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch (e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }
  instantiateAsync();
  return {};
}
var tempDouble;
var tempI64;
function _emscripten_set_main_loop_timing(mode, value) {
  Browser.mainLoop.timingMode = mode;
  Browser.mainLoop.timingValue = value;
  if (!Browser.mainLoop.func) {
    return 1;
  }
  if (!Browser.mainLoop.running) {
    Browser.mainLoop.running = true;
  }
  if (mode == 0) {
    Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
      var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
      setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
    };
    Browser.mainLoop.method = 'timeout';
  } else if (mode == 1) {
    Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
      Browser.requestAnimationFrame(Browser.mainLoop.runner);
    };
    Browser.mainLoop.method = 'rAF';
  } else if (mode == 2) {
    if (typeof setImmediate == 'undefined') {
      var setImmediates = [];
      var emscriptenMainLoopMessageId = 'setimmediate';
      var Browser_setImmediate_messageHandler = function (event) {
        if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
          event.stopPropagation();
          setImmediates.shift()();
        }
      };
      addEventListener('message', Browser_setImmediate_messageHandler, true);
      setImmediate = function Browser_emulated_setImmediate(func) {
        setImmediates.push(func);
        if (ENVIRONMENT_IS_WORKER) {
          if (Module['setImmediates'] === undefined) Module['setImmediates'] = [];
          Module['setImmediates'].push(func);
          postMessage({ target: emscriptenMainLoopMessageId });
        } else postMessage(emscriptenMainLoopMessageId, '*');
      };
    }
    Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
      setImmediate(Browser.mainLoop.runner);
    };
    Browser.mainLoop.method = 'immediate';
  }
  return 0;
}
var _emscripten_get_now;
_emscripten_get_now = () => performance.now();
function _exit(status) {
  exit(status);
}
function handleException(e) {
  if (e instanceof ExitStatus || e == 'unwind') {
    return EXITSTATUS;
  }
  quit_(1, e);
}
function maybeExit() {}
function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
  assert(
    !Browser.mainLoop.func,
    'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.'
  );
  Browser.mainLoop.func = browserIterationFunc;
  Browser.mainLoop.arg = arg;
  var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  function checkIsRunning() {
    if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
      maybeExit();
      return false;
    }
    return true;
  }
  Browser.mainLoop.running = false;
  Browser.mainLoop.runner = function Browser_mainLoop_runner() {
    if (ABORT) return;
    if (Browser.mainLoop.queue.length > 0) {
      var start = Date.now;
      var blocker = Browser.mainLoop.queue.shift();
      blocker.func(blocker.arg);
      if (Browser.mainLoop.remainingBlockers) {
        var remaining = Browser.mainLoop.remainingBlockers;
        var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
        if (blocker.counted) {
          Browser.mainLoop.remainingBlockers = next;
        } else {
          next = next + 0.5;
          Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
        }
      }
      out('main loop blocker "' + blocker.name + '" took ' + (Date.now - start) + ' ms');
      Browser.mainLoop.updateStatus();
      if (!checkIsRunning()) return;
      setTimeout(Browser.mainLoop.runner, 0);
      return;
    }
    if (!checkIsRunning()) return;
    Browser.mainLoop.currentFrameNumber = (Browser.mainLoop.currentFrameNumber + 1) | 0;
    if (
      Browser.mainLoop.timingMode == 1 &&
      Browser.mainLoop.timingValue > 1 &&
      Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0
    ) {
      Browser.mainLoop.scheduler();
      return;
    } else if (Browser.mainLoop.timingMode == 0) {
      Browser.mainLoop.tickStartTime = _emscripten_get_now();
    }
    Browser.mainLoop.runIter(browserIterationFunc);
    if (!checkIsRunning()) return;
    if (typeof SDL == 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
    Browser.mainLoop.scheduler();
  };
  if (!noSetTiming) {
    if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps);
    else _emscripten_set_main_loop_timing(1, 1);
    Browser.mainLoop.scheduler();
  }
  if (simulateInfiniteLoop) {
    throw 'unwind';
  }
}
function callUserCallback(func, synchronous) {
  if (ABORT) {
    return;
  }
  if (synchronous) {
    func();
    return;
  }
  try {
    func();
  } catch (e) {
    handleException(e);
  }
}
function safeSetTimeout(func, timeout) {
  return setTimeout(function () {
    callUserCallback(func);
  }, timeout);
}
var Browser = {
  mainLoop: {
    running: false,
    scheduler: null,
    method: '',
    currentlyRunningMainloop: 0,
    func: null,
    arg: 0,
    timingMode: 0,
    timingValue: 0,
    currentFrameNumber: 0,
    queue: [],
    pause: function () {
      Browser.mainLoop.scheduler = null;
      Browser.mainLoop.currentlyRunningMainloop++;
    },
    resume: function () {
      Browser.mainLoop.currentlyRunningMainloop++;
      var timingMode = Browser.mainLoop.timingMode;
      var timingValue = Browser.mainLoop.timingValue;
      var func = Browser.mainLoop.func;
      Browser.mainLoop.func = null;
      setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
      _emscripten_set_main_loop_timing(timingMode, timingValue);
      Browser.mainLoop.scheduler();
    },
    updateStatus: function () {
      if (Module['setStatus']) {
        var message = Module['statusMessage'] || 'Please wait...';
        var remaining = Browser.mainLoop.remainingBlockers;
        var expected = Browser.mainLoop.expectedBlockers;
        if (remaining) {
          if (remaining < expected) {
            Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
          } else {
            Module['setStatus'](message);
          }
        } else {
          Module['setStatus']('');
        }
      }
    },
    runIter: function (func) {
      if (ABORT) return;
      if (Module['preMainLoop']) {
        var preRet = Module['preMainLoop']();
        if (preRet === false) {
          return;
        }
      }
      callUserCallback(func);
      if (Module['postMainLoop']) Module['postMainLoop']();
    },
  },
  isFullscreen: false,
  pointerLock: false,
  moduleContextCreatedCallbacks: [],
  workers: [],
  init: function () {
    if (!Module['preloadPlugins']) Module['preloadPlugins'] = [];
    if (Browser.initted) return;
    Browser.initted = true;
    try {
      new Blob();
      Browser.hasBlobConstructor = true;
    } catch (e) {
      Browser.hasBlobConstructor = false;
      out('warning: no blob constructor, cannot create blobs with mimetypes');
    }
    Browser.BlobBuilder =
      typeof MozBlobBuilder != 'undefined'
        ? MozBlobBuilder
        : typeof WebKitBlobBuilder != 'undefined'
        ? WebKitBlobBuilder
        : !Browser.hasBlobConstructor
        ? out('warning: no BlobBuilder')
        : null;
    Browser.URLObject = typeof window != 'undefined' ? (window.URL ? window.URL : window.webkitURL) : undefined;
    if (!Module.noImageDecoding && typeof Browser.URLObject == 'undefined') {
      out(
        'warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.'
      );
      Module.noImageDecoding = true;
    }
    var imagePlugin = {};
    imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
      return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
    };
    imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
      var b = null;
      if (Browser.hasBlobConstructor) {
        try {
          b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          if (b.size !== byteArray.length) {
            b = new Blob([new Uint8Array(byteArray).buffer], { type: Browser.getMimetype(name) });
          }
        } catch (e) {
          warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
        }
      }
      if (!b) {
        var bb = new Browser.BlobBuilder();
        bb.append(new Uint8Array(byteArray).buffer);
        b = bb.getBlob();
      }
      var url = Browser.URLObject.createObjectURL(b);
      var img = new Image();
      img.onload = () => {
        assert(img.complete, 'Image ' + name + ' could not be decoded');
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        preloadedImages[name] = canvas;
        Browser.URLObject.revokeObjectURL(url);
        if (onload) onload(byteArray);
      };
      img.onerror = (event) => {
        out('Image ' + url + ' could not be decoded');
        if (onerror) onerror();
      };
      img.src = url;
    };
    Module['preloadPlugins'].push(imagePlugin);
    var audioPlugin = {};
    audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
      return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
    };
    audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
      var done = false;
      function finish(audio) {
        if (done) return;
        done = true;
        preloadedAudios[name] = audio;
        if (onload) onload(byteArray);
      }
      function fail() {
        if (done) return;
        done = true;
        preloadedAudios[name] = new Audio();
        if (onerror) onerror();
      }
      if (Browser.hasBlobConstructor) {
        try {
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
        } catch (e) {
          return fail();
        }
        var url = Browser.URLObject.createObjectURL(b);
        var audio = new Audio();
        audio.addEventListener(
          'canplaythrough',
          function () {
            finish(audio);
          },
          false
        );
        audio.onerror = function audio_onerror(event) {
          if (done) return;
          out('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
          function encode64(data) {
            var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            var PAD = '=';
            var ret = '';
            var leftchar = 0;
            var leftbits = 0;
            for (var i = 0; i < data.length; i++) {
              leftchar = (leftchar << 8) | data[i];
              leftbits += 8;
              while (leftbits >= 6) {
                var curr = (leftchar >> (leftbits - 6)) & 63;
                leftbits -= 6;
                ret += BASE[curr];
              }
            }
            if (leftbits == 2) {
              ret += BASE[(leftchar & 3) << 4];
              ret += PAD + PAD;
            } else if (leftbits == 4) {
              ret += BASE[(leftchar & 15) << 2];
              ret += PAD;
            }
            return ret;
          }
          audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
          finish(audio);
        };
        audio.src = url;
        safeSetTimeout(function () {
          finish(audio);
        }, 1e4);
      } else {
        return fail();
      }
    };
    Module['preloadPlugins'].push(audioPlugin);
    function pointerLockChange() {
      Browser.pointerLock =
        document['pointerLockElement'] === Module['canvas'] ||
        document['mozPointerLockElement'] === Module['canvas'] ||
        document['webkitPointerLockElement'] === Module['canvas'] ||
        document['msPointerLockElement'] === Module['canvas'];
    }
    var canvas = Module['canvas'];
    if (canvas) {
      canvas.requestPointerLock =
        canvas['requestPointerLock'] ||
        canvas['mozRequestPointerLock'] ||
        canvas['webkitRequestPointerLock'] ||
        canvas['msRequestPointerLock'] ||
        function () {};
      canvas.exitPointerLock =
        document['exitPointerLock'] ||
        document['mozExitPointerLock'] ||
        document['webkitExitPointerLock'] ||
        document['msExitPointerLock'] ||
        function () {};
      canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
      document.addEventListener('pointerlockchange', pointerLockChange, false);
      document.addEventListener('mozpointerlockchange', pointerLockChange, false);
      document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
      document.addEventListener('mspointerlockchange', pointerLockChange, false);
      if (Module['elementPointerLock']) {
        canvas.addEventListener(
          'click',
          function (ev) {
            if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
              Module['canvas'].requestPointerLock();
              ev.preventDefault();
            }
          },
          false
        );
      }
    }
  },
  handledByPreloadPlugin: function (byteArray, fullname, finish, onerror) {
    Browser.init();
    var handled = false;
    Module['preloadPlugins'].forEach(function (plugin) {
      if (handled) return;
      if (plugin['canHandle'](fullname)) {
        plugin['handle'](byteArray, fullname, finish, onerror);
        handled = true;
      }
    });
    return handled;
  },
  createContext: function (canvas, useWebGL, setInModule, webGLContextAttributes) {
    if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
    var ctx;
    var contextHandle;
    if (useWebGL) {
      var contextAttributes = { antialias: false, alpha: false, majorVersion: 1 };
      if (webGLContextAttributes) {
        for (var attribute in webGLContextAttributes) {
          contextAttributes[attribute] = webGLContextAttributes[attribute];
        }
      }
      if (typeof GL != 'undefined') {
        contextHandle = GL.createContext(canvas, contextAttributes);
        if (contextHandle) {
          ctx = GL.getContext(contextHandle).GLctx;
        }
      }
    } else {
      ctx = canvas.getContext('2d');
    }
    if (!ctx) return null;
    if (setInModule) {
      if (!useWebGL)
        assert(
          typeof GLctx == 'undefined',
          'cannot set in module if GLctx is used, but we are a non-GL context that would replace it'
        );
      Module.ctx = ctx;
      if (useWebGL) GL.makeContextCurrent(contextHandle);
      Module.useWebGL = useWebGL;
      Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
        callback();
      });
      Browser.init();
    }
    return ctx;
  },
  destroyContext: function (canvas, useWebGL, setInModule) {},
  fullscreenHandlersInstalled: false,
  lockPointer: undefined,
  resizeCanvas: undefined,
  requestFullscreen: function (lockPointer, resizeCanvas) {
    Browser.lockPointer = lockPointer;
    Browser.resizeCanvas = resizeCanvas;
    if (typeof Browser.lockPointer == 'undefined') Browser.lockPointer = true;
    if (typeof Browser.resizeCanvas == 'undefined') Browser.resizeCanvas = false;
    var canvas = Module['canvas'];
    function fullscreenChange() {
      Browser.isFullscreen = false;
      var canvasContainer = canvas.parentNode;
      if (
        (document['fullscreenElement'] ||
          document['mozFullScreenElement'] ||
          document['msFullscreenElement'] ||
          document['webkitFullscreenElement'] ||
          document['webkitCurrentFullScreenElement']) === canvasContainer
      ) {
        canvas.exitFullscreen = Browser.exitFullscreen;
        if (Browser.lockPointer) canvas.requestPointerLock();
        Browser.isFullscreen = true;
        if (Browser.resizeCanvas) {
          Browser.setFullscreenCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      } else {
        canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
        canvasContainer.parentNode.removeChild(canvasContainer);
        if (Browser.resizeCanvas) {
          Browser.setWindowedCanvasSize();
        } else {
          Browser.updateCanvasDimensions(canvas);
        }
      }
      if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullscreen);
      if (Module['onFullscreen']) Module['onFullscreen'](Browser.isFullscreen);
    }
    if (!Browser.fullscreenHandlersInstalled) {
      Browser.fullscreenHandlersInstalled = true;
      document.addEventListener('fullscreenchange', fullscreenChange, false);
      document.addEventListener('mozfullscreenchange', fullscreenChange, false);
      document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
      document.addEventListener('MSFullscreenChange', fullscreenChange, false);
    }
    var canvasContainer = document.createElement('div');
    canvas.parentNode.insertBefore(canvasContainer, canvas);
    canvasContainer.appendChild(canvas);
    canvasContainer.requestFullscreen =
      canvasContainer['requestFullscreen'] ||
      canvasContainer['mozRequestFullScreen'] ||
      canvasContainer['msRequestFullscreen'] ||
      (canvasContainer['webkitRequestFullscreen']
        ? function () {
            canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']);
          }
        : null) ||
      (canvasContainer['webkitRequestFullScreen']
        ? function () {
            canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']);
          }
        : null);
    canvasContainer.requestFullscreen();
  },
  exitFullscreen: function () {
    if (!Browser.isFullscreen) {
      return false;
    }
    var CFS =
      document['exitFullscreen'] ||
      document['cancelFullScreen'] ||
      document['mozCancelFullScreen'] ||
      document['msExitFullscreen'] ||
      document['webkitCancelFullScreen'] ||
      function () {};
    CFS.apply(document, []);
    return true;
  },
  nextRAF: 0,
  fakeRequestAnimationFrame: function (func) {
    var now = Date.now;
    if (Browser.nextRAF === 0) {
      Browser.nextRAF = now + 1e3 / 60;
    } else {
      while (now + 2 >= Browser.nextRAF) {
        Browser.nextRAF += 1e3 / 60;
      }
    }
    var delay = Math.max(Browser.nextRAF - now, 0);
    setTimeout(func, delay);
  },
  requestAnimationFrame: function (func) {
    if (typeof requestAnimationFrame == 'function') {
      requestAnimationFrame(func);
      return;
    }
    var RAF = Browser.fakeRequestAnimationFrame;
    RAF(func);
  },
  safeSetTimeout: function (func) {
    return safeSetTimeout(func);
  },
  safeRequestAnimationFrame: function (func) {
    return Browser.requestAnimationFrame(function () {
      callUserCallback(func);
    });
  },
  getMimetype: function (name) {
    return {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      bmp: 'image/bmp',
      ogg: 'audio/ogg',
      wav: 'audio/wav',
      mp3: 'audio/mpeg',
    }[name.substr(name.lastIndexOf('.') + 1)];
  },
  getUserMedia: function (func) {
    if (!window.getUserMedia) {
      window.getUserMedia = navigator['getUserMedia'] || navigator['mozGetUserMedia'];
    }
    window.getUserMedia(func);
  },
  getMovementX: function (event) {
    return event['movementX'] || event['mozMovementX'] || event['webkitMovementX'] || 0;
  },
  getMovementY: function (event) {
    return event['movementY'] || event['mozMovementY'] || event['webkitMovementY'] || 0;
  },
  getMouseWheelDelta: function (event) {
    var delta = 0;
    switch (event.type) {
      case 'DOMMouseScroll':
        delta = event.detail / 3;
        break;
      case 'mousewheel':
        delta = event.wheelDelta / 120;
        break;
      case 'wheel':
        delta = event.deltaY;
        switch (event.deltaMode) {
          case 0:
            delta /= 100;
            break;
          case 1:
            delta /= 3;
            break;
          case 2:
            delta *= 80;
            break;
          default:
            throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
        }
        break;
      default:
        throw 'unrecognized mouse wheel event: ' + event.type;
    }
    return delta;
  },
  mouseX: 0,
  mouseY: 0,
  mouseMovementX: 0,
  mouseMovementY: 0,
  touches: {},
  lastTouches: {},
  calculateMouseEvent: function (event) {
    if (Browser.pointerLock) {
      if (event.type != 'mousemove' && 'mozMovementX' in event) {
        Browser.mouseMovementX = Browser.mouseMovementY = 0;
      } else {
        Browser.mouseMovementX = Browser.getMovementX(event);
        Browser.mouseMovementY = Browser.getMovementY(event);
      }
      if (typeof SDL != 'undefined') {
        Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
        Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
      } else {
        Browser.mouseX += Browser.mouseMovementX;
        Browser.mouseY += Browser.mouseMovementY;
      }
    } else {
      var rect = Module['canvas'].getBoundingClientRect();
      var cw = Module['canvas'].width;
      var ch = Module['canvas'].height;
      var scrollX = typeof window.scrollX != 'undefined' ? window.scrollX : window.pageXOffset;
      var scrollY = typeof window.scrollY != 'undefined' ? window.scrollY : window.pageYOffset;
      if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
        var touch = event.touch;
        if (touch === undefined) {
          return;
        }
        var adjustedX = touch.pageX - (scrollX + rect.left);
        var adjustedY = touch.pageY - (scrollY + rect.top);
        adjustedX = adjustedX * (cw / rect.width);
        adjustedY = adjustedY * (ch / rect.height);
        var coords = { x: adjustedX, y: adjustedY };
        if (event.type === 'touchstart') {
          Browser.lastTouches[touch.identifier] = coords;
          Browser.touches[touch.identifier] = coords;
        } else if (event.type === 'touchend' || event.type === 'touchmove') {
          var last = Browser.touches[touch.identifier];
          if (!last) last = coords;
          Browser.lastTouches[touch.identifier] = last;
          Browser.touches[touch.identifier] = coords;
        }
        return;
      }
      var x = event.pageX - (scrollX + rect.left);
      var y = event.pageY - (scrollY + rect.top);
      x = x * (cw / rect.width);
      y = y * (ch / rect.height);
      Browser.mouseMovementX = x - Browser.mouseX;
      Browser.mouseMovementY = y - Browser.mouseY;
      Browser.mouseX = x;
      Browser.mouseY = y;
    }
  },
  resizeListeners: [],
  updateResizeListeners: function () {
    var canvas = Module['canvas'];
    Browser.resizeListeners.forEach(function (listener) {
      listener(canvas.width, canvas.height);
    });
  },
  setCanvasSize: function (width, height, noUpdates) {
    var canvas = Module['canvas'];
    Browser.updateCanvasDimensions(canvas, width, height);
    if (!noUpdates) Browser.updateResizeListeners();
  },
  windowedWidth: 0,
  windowedHeight: 0,
  setFullscreenCanvasSize: function () {
    if (typeof SDL != 'undefined') {
      var flags = HEAPU32[SDL.screen >> 2];
      flags = flags | 8388608;
      HEAP32[SDL.screen >> 2] = flags;
    }
    Browser.updateCanvasDimensions(Module['canvas']);
    Browser.updateResizeListeners();
  },
  setWindowedCanvasSize: function () {
    if (typeof SDL != 'undefined') {
      var flags = HEAPU32[SDL.screen >> 2];
      flags = flags & ~8388608;
      HEAP32[SDL.screen >> 2] = flags;
    }
    Browser.updateCanvasDimensions(Module['canvas']);
    Browser.updateResizeListeners();
  },
  updateCanvasDimensions: function (canvas, wNative, hNative) {
    if (wNative && hNative) {
      canvas.widthNative = wNative;
      canvas.heightNative = hNative;
    } else {
      wNative = canvas.widthNative;
      hNative = canvas.heightNative;
    }
    var w = wNative;
    var h = hNative;
    if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
      if (w / h < Module['forcedAspectRatio']) {
        w = Math.round(h * Module['forcedAspectRatio']);
      } else {
        h = Math.round(w / Module['forcedAspectRatio']);
      }
    }
    if (
      (document['fullscreenElement'] ||
        document['mozFullScreenElement'] ||
        document['msFullscreenElement'] ||
        document['webkitFullscreenElement'] ||
        document['webkitCurrentFullScreenElement']) === canvas.parentNode &&
      typeof screen != 'undefined'
    ) {
      var factor = Math.min(screen.width / w, screen.height / h);
      w = Math.round(w * factor);
      h = Math.round(h * factor);
    }
    if (Browser.resizeCanvas) {
      if (canvas.width != w) canvas.width = w;
      if (canvas.height != h) canvas.height = h;
      if (typeof canvas.style != 'undefined') {
        canvas.style.removeProperty('width');
        canvas.style.removeProperty('height');
      }
    } else {
      if (canvas.width != wNative) canvas.width = wNative;
      if (canvas.height != hNative) canvas.height = hNative;
      if (typeof canvas.style != 'undefined') {
        if (w != wNative || h != hNative) {
          canvas.style.setProperty('width', w + 'px', 'important');
          canvas.style.setProperty('height', h + 'px', 'important');
        } else {
          canvas.style.removeProperty('width');
          canvas.style.removeProperty('height');
        }
      }
    }
  },
};
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    callbacks.shift()(Module);
  }
}
function getValue(ptr, type = 'i8') {
  if (type.endsWith('*')) type = '*';
  switch (type) {
    case 'i1':
      return HEAP8[ptr >> 0];
    case 'i8':
      return HEAP8[ptr >> 0];
    case 'i16':
      return HEAP16[ptr >> 1];
    case 'i32':
      return HEAP32[ptr >> 2];
    case 'i64':
      return HEAP32[ptr >> 2];
    case 'float':
      return HEAPF32[ptr >> 2];
    case 'double':
      return HEAPF64[ptr >> 3];
    case '*':
      return HEAPU32[ptr >> 2];
    default:
      abort('invalid type for getValue: ' + type);
  }
  return null;
}
var wasmTableMirror = [];
function getWasmTableEntry(funcPtr) {
  var func = wasmTableMirror[funcPtr];
  if (!func) {
    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
  }
  return func;
}
function ___assert_fail(condition, filename, line, func) {
  abort(
    'Assertion failed: ' +
      UTF8ToString(condition) +
      ', at: ' +
      [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']
  );
}
var PATH = {
  isAbs: (path) => path.charAt(0) === '/',
  splitPath: (filename) => {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: (parts, allowAboveRoot) => {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    if (allowAboveRoot) {
      for (; up; up--) {
        parts.unshift('..');
      }
    }
    return parts;
  },
  normalize: (path) => {
    var isAbsolute = PATH.isAbs(path),
      trailingSlash = path.substr(-1) === '/';
    path = PATH.normalizeArray(
      path.split('/').filter((p) => !!p),
      !isAbsolute
    ).join('/');
    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }
    return (isAbsolute ? '/' : '') + path;
  },
  dirname: (path) => {
    var result = PATH.splitPath(path),
      root = result[0],
      dir = result[1];
    if (!root && !dir) {
      return '.';
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  },
  basename: (path) => {
    if (path === '/') return '/';
    path = PATH.normalize(path);
    path = path.replace(/\/$/, '');
    var lastSlash = path.lastIndexOf('/');
    if (lastSlash === -1) return path;
    return path.substr(lastSlash + 1);
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return PATH.normalize(paths.join('/'));
  },
  join2: (l, r) => {
    return PATH.normalize(l + '/' + r);
  },
};
function getRandomDevice() {
  if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
    var randomBuffer = new Uint8Array(1);
    return function () {
      crypto.getRandomValues(randomBuffer);
      return randomBuffer[0];
    };
  } else
    return function () {
      abort('randomDevice');
    };
}
var PATH_FS = {
  resolve: function () {
    var resolvedPath = '',
      resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd();
      if (typeof path != 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        return '';
      }
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = PATH.isAbs(path);
    }
    resolvedPath = PATH.normalizeArray(
      resolvedPath.split('/').filter((p) => !!p),
      !resolvedAbsolute
    ).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  },
  relative: (from, to) => {
    from = PATH_FS.resolve(from).substr(1);
    to = PATH_FS.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  },
};
var TTY = {
  ttys: [],
  init: function () {},
  shutdown: function () {},
  register: function (dev, ops) {
    TTY.ttys[dev] = { input: [], output: [], ops: ops };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty);
    },
    read: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now;
      }
      return bytesRead;
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.timestamp = Date.now;
      }
      return i;
    },
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null;
        if (typeof window != 'undefined' && typeof window.prompt == 'function') {
          result = window.prompt('Input: ');
          if (result !== null) {
            result += '\n';
          }
        } else if (typeof readline == 'function') {
          result = readline();
          if (result !== null) {
            result += '\n';
          }
        }
        if (!result) {
          return null;
        }
        tty.input = intArrayFromString(result, true);
      }
      return tty.input.shift();
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0));
        tty.output = [];
      }
    },
  },
};
function zeroMemory(address, size) {
  HEAPU8.fill(0, address, address + size);
}
function alignMemory(size, alignment) {
  return Math.ceil(size / alignment) * alignment;
}
function mmapAlloc(size) {
  size = alignMemory(size, 65536);
  var ptr = _emscripten_builtin_memalign(65536, size);
  if (!ptr) return 0;
  zeroMemory(ptr, size);
  return ptr;
}
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, '/', 16384 | 511, 0);
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      throw new FS.ErrnoError(63);
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: { llseek: MEMFS.stream_ops.llseek },
        },
        file: {
          node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: {
          node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink },
          stream: {},
        },
        chrdev: {
          node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
          stream: FS.chrdev_stream_ops,
        },
      };
    }
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      node.usedBytes = 0;
      node.contents = null;
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.timestamp = Date.now;
    if (parent) {
      parent.contents[name] = node;
      parent.timestamp = node.timestamp;
    }
    return node;
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array(0);
    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
    return new Uint8Array(node.contents);
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0;
    if (prevCapacity >= newCapacity) return;
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
    var oldContents = node.contents;
    node.contents = new Uint8Array(newCapacity);
    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return;
    if (newSize == 0) {
      node.contents = null;
      node.usedBytes = 0;
    } else {
      var oldContents = node.contents;
      node.contents = new Uint8Array(newSize);
      if (oldContents) {
        node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
      }
      node.usedBytes = newSize;
    }
  },
  node_ops: {
    getattr: function (node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.timestamp);
      attr.mtime = new Date(node.timestamp);
      attr.ctime = new Date(node.timestamp);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode;
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp;
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[44];
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename: function (old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
      }
      delete old_node.parent.contents[old_node.name];
      old_node.parent.timestamp = Date.now;
      old_node.name = new_name;
      new_dir.contents[new_name] = old_node;
      new_dir.timestamp = old_node.parent.timestamp;
      old_node.parent = new_dir;
    },
    unlink: function (parent, name) {
      delete parent.contents[name];
      parent.timestamp = Date.now;
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.timestamp = Date.now;
    },
    readdir: function (node) {
      var entries = ['.', '..'];
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue;
        }
        entries.push(key);
      }
      return entries;
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    },
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
      }
      return size;
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.timestamp = Date.now;
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    },
    llseek: function (stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    },
    mmap: function (stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length);
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length);
          }
        }
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        HEAP8.set(contents, ptr);
      }
      return { ptr: ptr, allocated: allocated };
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (mmapFlags & 2) {
        return 0;
      }
      var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      return 0;
    },
  },
};
function asyncLoad(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
  readAsync(
    url,
    function (arrayBuffer) {
      assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
      onload(new Uint8Array(arrayBuffer));
      if (dep) removeRunDependency(dep);
    },
    function (event) {
      if (onerror) {
        onerror();
      } else {
        throw 'Loading data file "' + url + '" failed.';
      }
    }
  );
  if (dep) addRunDependency(dep);
}
var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: '/',
  initialized: false,
  ignorePermissions: true,
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  lookupPath: (path, opts = {}) => {
    path = PATH_FS.resolve(FS.cwd(), path);
    if (!path) return { path: '', node: null };
    var defaults = { follow_mount: true, recurse_count: 0 };
    opts = Object.assign(defaults, opts);
    if (opts.recurse_count > 8) {
      throw new FS.ErrnoError(32);
    }
    var parts = PATH.normalizeArray(
      path.split('/').filter((p) => !!p),
      false
    );
    var current = FS.root;
    var current_path = '/';
    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1;
      if (islast && opts.parent) {
        break;
      }
      current = FS.lookupNode(current, parts[i]);
      current_path = PATH.join2(current_path, parts[i]);
      if (FS.isMountpoint(current)) {
        if (!islast || (islast && opts.follow_mount)) {
          current = current.mounted.root;
        }
      }
      if (!islast || opts.follow) {
        var count = 0;
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path);
          current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
          var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
          current = lookup.node;
          if (count++ > 40) {
            throw new FS.ErrnoError(32);
          }
        }
      }
    }
    return { path: current_path, node: current };
  },
  getPath: (node) => {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path;
      }
      path = path ? node.name + '/' + path : node.name;
      node = node.parent;
    }
  },
  hashName: (parentid, name) => {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode: (node) => {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode: (node) => {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode: (parent, name) => {
    var errCode = FS.mayLookup(parent);
    if (errCode) {
      throw new FS.ErrnoError(errCode, parent);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    return FS.lookup(parent, name);
  },
  createNode: (parent, name, mode, rdev) => {
    var node = new FS.FSNode(parent, name, mode, rdev);
    FS.hashAddNode(node);
    return node;
  },
  destroyNode: (node) => {
    FS.hashRemoveNode(node);
  },
  isRoot: (node) => {
    return node === node.parent;
  },
  isMountpoint: (node) => {
    return !!node.mounted;
  },
  isFile: (mode) => {
    return (mode & 61440) === 32768;
  },
  isDir: (mode) => {
    return (mode & 61440) === 16384;
  },
  isLink: (mode) => {
    return (mode & 61440) === 40960;
  },
  isChrdev: (mode) => {
    return (mode & 61440) === 8192;
  },
  isBlkdev: (mode) => {
    return (mode & 61440) === 24576;
  },
  isFIFO: (mode) => {
    return (mode & 61440) === 4096;
  },
  isSocket: (mode) => {
    return (mode & 49152) === 49152;
  },
  flagModes: { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
  modeStringToFlags: (str) => {
    var flags = FS.flagModes[str];
    if (typeof flags == 'undefined') {
      throw new Error('Unknown file open mode: ' + str);
    }
    return flags;
  },
  flagsToPermissionString: (flag) => {
    var perms = ['r', 'w', 'rw'][flag & 3];
    if (flag & 512) {
      perms += 'w';
    }
    return perms;
  },
  nodePermissions: (node, perms) => {
    if (FS.ignorePermissions) {
      return 0;
    }
    if (perms.includes('r') && !(node.mode & 292)) {
      return 2;
    } else if (perms.includes('w') && !(node.mode & 146)) {
      return 2;
    } else if (perms.includes('x') && !(node.mode & 73)) {
      return 2;
    }
    return 0;
  },
  mayLookup: (dir) => {
    var errCode = FS.nodePermissions(dir, 'x');
    if (errCode) return errCode;
    if (!dir.node_ops.lookup) return 2;
    return 0;
  },
  mayCreate: (dir, name) => {
    try {
      var node = FS.lookupNode(dir, name);
      return 20;
    } catch (e) {}
    return FS.nodePermissions(dir, 'wx');
  },
  mayDelete: (dir, name, isdir) => {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var errCode = FS.nodePermissions(dir, 'wx');
    if (errCode) {
      return errCode;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10;
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31;
      }
    }
    return 0;
  },
  mayOpen: (node, flags) => {
    if (!node) {
      return 44;
    }
    if (FS.isLink(node.mode)) {
      return 32;
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
        return 31;
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd: (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(33);
  },
  getStream: (fd) => FS.streams[fd],
  createStream: (stream, fd_start, fd_end) => {
    if (!FS.FSStream) {
      FS.FSStream = function () {
        this.shared = {};
      };
      FS.FSStream.prototype = {};
      Object.defineProperties(FS.FSStream.prototype, {
        object: {
          get: function () {
            return this.node;
          },
          set: function (val) {
            this.node = val;
          },
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1;
          },
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0;
          },
        },
        isAppend: {
          get: function () {
            return this.flags & 1024;
          },
        },
        flags: {
          get: function () {
            return this.shared.flags;
          },
          set: function (val) {
            this.shared.flags = val;
          },
        },
        position: {
          get: function () {
            return this.shared.position;
          },
          set: function (val) {
            this.shared.position = val;
          },
        },
      });
    }
    stream = Object.assign(new FS.FSStream(), stream);
    var fd = FS.nextfd(fd_start, fd_end);
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream: (fd) => {
    FS.streams[fd] = null;
  },
  chrdev_stream_ops: {
    open: (stream) => {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
    },
    llseek: () => {
      throw new FS.ErrnoError(70);
    },
  },
  major: (dev) => dev >> 8,
  minor: (dev) => dev & 255,
  makedev: (ma, mi) => (ma << 8) | mi,
  registerDevice: (dev, ops) => {
    FS.devices[dev] = { stream_ops: ops };
  },
  getDevice: (dev) => FS.devices[dev],
  getMounts: (mount) => {
    var mounts = [];
    var check = [mount];
    while (check.length) {
      var m = check.pop();
      mounts.push(m);
      check.push.apply(check, m.mounts);
    }
    return mounts;
  },
  syncfs: (populate, callback) => {
    if (typeof populate == 'function') {
      callback = populate;
      populate = false;
    }
    FS.syncFSRequests++;
    if (FS.syncFSRequests > 1) {
      err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
    }
    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;
    function doCallback(errCode) {
      FS.syncFSRequests--;
      return callback(errCode);
    }
    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(errCode);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }
    mounts.forEach((mount) => {
      if (!mount.type.syncfs) {
        return done(null);
      }
      mount.type.syncfs(mount, populate, done);
    });
  },
  mount: (type, opts, mountpoint) => {
    var root = mountpoint === '/';
    var pseudo = !mountpoint;
    var node;
    if (root && FS.root) {
      throw new FS.ErrnoError(10);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      mountpoint = lookup.path;
      node = lookup.node;
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
    }
    var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;
    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      node.mounted = mount;
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }
    return mountRoot;
  },
  unmount: (mountpoint) => {
    var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28);
    }
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);
    Object.keys(FS.nameTable).forEach((hash) => {
      var current = FS.nameTable[hash];
      while (current) {
        var next = current.name_next;
        if (mounts.includes(current.mount)) {
          FS.destroyNode(current);
        }
        current = next;
      }
    });
    node.mounted = null;
    var idx = node.mount.mounts.indexOf(mount);
    node.mount.mounts.splice(idx, 1);
  },
  lookup: (parent, name) => {
    return parent.node_ops.lookup(parent, name);
  },
  mknod: (path, mode, dev) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name || name === '.' || name === '..') {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.mayCreate(parent, name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  create: (path, mode) => {
    mode = mode !== undefined ? mode : 438;
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir: (path, mode) => {
    mode = mode !== undefined ? mode : 511;
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree: (path, mode) => {
    var dirs = path.split('/');
    var d = '';
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue;
      d += '/' + dirs[i];
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
    }
  },
  mkdev: (path, mode, dev) => {
    if (typeof dev == 'undefined') {
      dev = mode;
      mode = 438;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink: (oldpath, newpath) => {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44);
    }
    var lookup = FS.lookupPath(newpath, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename: (old_path, new_path) => {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    var lookup, old_dir, new_dir;
    lookup = FS.lookupPath(old_path, { parent: true });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, { parent: true });
    new_dir = lookup.node;
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75);
    }
    var old_node = FS.lookupNode(old_dir, old_name);
    var relative = PATH_FS.relative(old_path, new_dirname);
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(28);
    }
    relative = PATH_FS.relative(new_path, old_dirname);
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(55);
    }
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (old_node === new_node) {
      return;
    }
    var isdir = FS.isDir(old_node.mode);
    var errCode = FS.mayDelete(old_dir, old_name, isdir);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10);
    }
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, 'w');
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    FS.hashRemoveNode(old_node);
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
    } catch (e) {
      throw e;
    } finally {
      FS.hashAddNode(old_node);
    }
  },
  rmdir: (path) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, true);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
  },
  readdir: (path) => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(54);
    }
    return node.node_ops.readdir(node);
  },
  unlink: (path) => {
    var lookup = FS.lookupPath(path, { parent: true });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, false);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
  },
  readlink: (path) => {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(44);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28);
    }
    return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
  },
  stat: (path, dontFollow) => {
    var lookup = FS.lookupPath(path, { follow: !dontFollow });
    var node = lookup.node;
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(63);
    }
    return node.node_ops.getattr(node);
  },
  lstat: (path) => {
    return FS.stat(path, true);
  },
  chmod: (path, mode, dontFollow) => {
    var node;
    if (typeof path == 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, { mode: (mode & 4095) | (node.mode & ~4095), timestamp: Date.now });
  },
  lchmod: (path, mode) => {
    FS.chmod(path, mode, true);
  },
  fchmod: (fd, mode) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chmod(stream.node, mode);
  },
  chown: (path, uid, gid, dontFollow) => {
    var node;
    if (typeof path == 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    node.node_ops.setattr(node, { timestamp: Date.now });
  },
  lchown: (path, uid, gid) => {
    FS.chown(path, uid, gid, true);
  },
  fchown: (fd, uid, gid) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    FS.chown(stream.node, uid, gid);
  },
  truncate: (path, len) => {
    if (len < 0) {
      throw new FS.ErrnoError(28);
    }
    var node;
    if (typeof path == 'string') {
      var lookup = FS.lookupPath(path, { follow: true });
      node = lookup.node;
    } else {
      node = path;
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.nodePermissions(node, 'w');
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    node.node_ops.setattr(node, { size: len, timestamp: Date.now });
  },
  ftruncate: (fd, len) => {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28);
    }
    FS.truncate(stream.node, len);
  },
  utime: (path, atime, mtime) => {
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
  },
  open: (path, flags, mode) => {
    if (path === '') {
      throw new FS.ErrnoError(44);
    }
    flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
    mode = typeof mode == 'undefined' ? 438 : mode;
    if (flags & 64) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    if (typeof path == 'object') {
      node = path;
    } else {
      path = PATH.normalize(path);
      try {
        var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
        node = lookup.node;
      } catch (e) {}
    }
    var created = false;
    if (flags & 64) {
      if (node) {
        if (flags & 128) {
          throw new FS.ErrnoError(20);
        }
      } else {
        node = FS.mknod(path, mode, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54);
    }
    if (!created) {
      var errCode = FS.mayOpen(node, flags);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    if (flags & 512 && !created) {
      FS.truncate(node, 0);
    }
    flags &= ~(128 | 512 | 131072);
    var stream = FS.createStream({
      node: node,
      path: FS.getPath(node),
      flags: flags,
      seekable: true,
      position: 0,
      stream_ops: node.stream_ops,
      ungotten: [],
      error: false,
    });
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (Module['logReadFiles'] && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {};
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1;
      }
    }
    return stream;
  },
  close: (stream) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (stream.getdents) stream.getdents = null;
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed: (stream) => {
    return stream.fd === null;
  },
  llseek: (stream, offset, whence) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70);
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read: (stream, buffer, offset, length, position) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28);
    }
    var seeking = typeof position != 'undefined';
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write: (stream, buffer, offset, length, position, canOwn) => {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28);
    }
    if (stream.seekable && stream.flags & 1024) {
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position != 'undefined';
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
    if (!seeking) stream.position += bytesWritten;
    return bytesWritten;
  },
  allocate: (stream, offset, length) => {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(28);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(138);
    }
    stream.stream_ops.allocate(stream, offset, length);
  },
  mmap: (stream, length, position, prot, flags) => {
    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
      throw new FS.ErrnoError(2);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43);
    }
    return stream.stream_ops.mmap(stream, length, position, prot, flags);
  },
  msync: (stream, buffer, offset, length, mmapFlags) => {
    if (!stream || !stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  munmap: (stream) => 0,
  ioctl: (stream, cmd, arg) => {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile: (path, opts = {}) => {
    opts.flags = opts.flags || 0;
    opts.encoding = opts.encoding || 'binary';
    if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
      throw new Error('Invalid encoding type "' + opts.encoding + '"');
    }
    var ret;
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === 'utf8') {
      ret = UTF8ArrayToString(buf, 0);
    } else if (opts.encoding === 'binary') {
      ret = buf;
    }
    FS.close(stream);
    return ret;
  },
  writeFile: (path, data, opts = {}) => {
    opts.flags = opts.flags || 577;
    var stream = FS.open(path, opts.flags, opts.mode);
    if (typeof data == 'string') {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    } else {
      throw new Error('Unsupported data type');
    }
    FS.close(stream);
  },
  cwd: () => FS.currentPath,
  chdir: (path) => {
    var lookup = FS.lookupPath(path, { follow: true });
    if (lookup.node === null) {
      throw new FS.ErrnoError(44);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54);
    }
    var errCode = FS.nodePermissions(lookup.node, 'x');
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories: () => {
    FS.mkdir('/tmp');
    FS.mkdir('/home');
    FS.mkdir('/home/web_user');
  },
  createDefaultDevices: () => {
    FS.mkdir('/dev');
    FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length });
    FS.mkdev('/dev/null', FS.makedev(1, 3));
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev('/dev/tty', FS.makedev(5, 0));
    FS.mkdev('/dev/tty1', FS.makedev(6, 0));
    var random_device = getRandomDevice();
    FS.createDevice('/dev', 'random', random_device);
    FS.createDevice('/dev', 'urandom', random_device);
    FS.mkdir('/dev/shm');
    FS.mkdir('/dev/shm/tmp');
  },
  createSpecialDirectories: () => {
    FS.mkdir('/proc');
    var proc_self = FS.mkdir('/proc/self');
    FS.mkdir('/proc/self/fd');
    FS.mount(
      {
        mount: () => {
          var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73);
          node.node_ops = {
            lookup: (parent, name) => {
              var fd = +name;
              var stream = FS.getStream(fd);
              if (!stream) throw new FS.ErrnoError(8);
              var ret = { parent: null, mount: { mountpoint: 'fake' }, node_ops: { readlink: () => stream.path } };
              ret.parent = ret;
              return ret;
            },
          };
          return node;
        },
      },
      {},
      '/proc/self/fd'
    );
  },
  createStandardStreams: () => {
    if (Module['stdin']) {
      FS.createDevice('/dev', 'stdin', Module['stdin']);
    } else {
      FS.symlink('/dev/tty', '/dev/stdin');
    }
    if (Module['stdout']) {
      FS.createDevice('/dev', 'stdout', null, Module['stdout']);
    } else {
      FS.symlink('/dev/tty', '/dev/stdout');
    }
    if (Module['stderr']) {
      FS.createDevice('/dev', 'stderr', null, Module['stderr']);
    } else {
      FS.symlink('/dev/tty1', '/dev/stderr');
    }
    var stdin = FS.open('/dev/stdin', 0);
    var stdout = FS.open('/dev/stdout', 1);
    var stderr = FS.open('/dev/stderr', 1);
  },
  ensureErrnoError: () => {
    if (FS.ErrnoError) return;
    FS.ErrnoError = function ErrnoError(errno, node) {
      this.node = node;
      this.setErrno = function (errno) {
        this.errno = errno;
      };
      this.setErrno(errno);
      this.message = 'FS error';
    };
    FS.ErrnoError.prototype = new Error();
    FS.ErrnoError.prototype.constructor = FS.ErrnoError;
    [44].forEach((code) => {
      FS.genericErrors[code] = new FS.ErrnoError(code);
      FS.genericErrors[code].stack = '<generic error, no stack>';
    });
  },
  staticInit: () => {
    FS.ensureErrnoError();
    FS.nameTable = new Array(4096);
    FS.mount(MEMFS, {}, '/');
    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();
    FS.filesystems = { MEMFS: MEMFS };
  },
  init: (input, output, error) => {
    FS.init.initialized = true;
    FS.ensureErrnoError();
    Module['stdin'] = input || Module['stdin'];
    Module['stdout'] = output || Module['stdout'];
    Module['stderr'] = error || Module['stderr'];
    FS.createStandardStreams();
  },
  quit: () => {
    FS.init.initialized = false;
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i];
      if (!stream) {
        continue;
      }
      FS.close(stream);
    }
  },
  getMode: (canRead, canWrite) => {
    var mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode;
  },
  findObject: (path, dontResolveLastLink) => {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      return null;
    }
  },
  analyzePath: (path, dontResolveLastLink) => {
    try {
      var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null,
    };
    try {
      var lookup = FS.lookupPath(path, { parent: true });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === '/';
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createPath: (parent, path, canRead, canWrite) => {
    parent = typeof parent == 'string' ? parent : FS.getPath(parent);
    var parts = path.split('/').reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {}
      parent = current;
    }
    return current;
  },
  createFile: (parent, name, properties, canRead, canWrite) => {
    var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
    var mode = FS.getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
    var path = name;
    if (parent) {
      parent = typeof parent == 'string' ? parent : FS.getPath(parent);
      path = name ? PATH.join2(parent, name) : parent;
    }
    var mode = FS.getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      if (typeof data == 'string') {
        var arr = new Array(data.length);
        for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
        data = arr;
      }
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 577);
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
    return node;
  },
  createDevice: (parent, name, input, output) => {
    var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
    var mode = FS.getMode(!!input, !!output);
    if (!FS.createDevice.major) FS.createDevice.major = 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    FS.registerDevice(dev, {
      open: (stream) => {
        stream.seekable = false;
      },
      close: (stream) => {
        if (output && output.buffer && output.buffer.length) {
          output(10);
        }
      },
      read: (stream, buffer, offset, length, pos) => {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now;
        }
        return bytesRead;
      },
      write: (stream, buffer, offset, length, pos) => {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.timestamp = Date.now;
        }
        return i;
      },
    });
    return FS.mkdev(path, mode, dev);
  },
  forceLoadFile: (obj) => {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    if (typeof XMLHttpRequest != 'undefined') {
      throw new Error(
        'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
      );
    } else if (read_) {
      try {
        obj.contents = intArrayFromString(read_(obj.url), true);
        obj.usedBytes = obj.contents.length;
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    } else {
      throw new Error('Cannot load without read() or XMLHttpRequest.');
    }
  },
  createLazyFile: (parent, name, url, canRead, canWrite) => {
    function LazyUint8Array() {
      this.lengthKnown = false;
      this.chunks = [];
    }
    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
      if (idx > this.length - 1 || idx < 0) {
        return undefined;
      }
      var chunkOffset = idx % this.chunkSize;
      var chunkNum = (idx / this.chunkSize) | 0;
      return this.getter(chunkNum)[chunkOffset];
    };
    LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
      this.getter = getter;
    };
    LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
      var xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, false);
      xhr.send(null);
      if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
        throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
      var datalength = Number(xhr.getResponseHeader('Content-length'));
      var header;
      var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes';
      var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip';
      var chunkSize = 1024 * 1024;
      if (!hasByteServing) chunkSize = datalength;
      var doXHR = (from, to) => {
        if (from > to) throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!');
        if (to > datalength - 1) throw new Error('only ' + datalength + ' bytes available! programmer error!');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to);
        xhr.responseType = 'arraybuffer';
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
        xhr.send(null);
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
          throw new Error("Couldn't load " + url + '. Status: ' + xhr.status);
        if (xhr.response !== undefined) {
          return new Uint8Array(xhr.response || []);
        } else {
          return intArrayFromString(xhr.responseText || '', true);
        }
      };
      var lazyArray = this;
      lazyArray.setDataGetter((chunkNum) => {
        var start = chunkNum * chunkSize;
        var end = (chunkNum + 1) * chunkSize - 1;
        end = Math.min(end, datalength - 1);
        if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
          lazyArray.chunks[chunkNum] = doXHR(start, end);
        }
        if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
        return lazyArray.chunks[chunkNum];
      });
      if (usesGzip || !datalength) {
        chunkSize = datalength = 1;
        datalength = this.getter(0).length;
        chunkSize = datalength;
        out('LazyFiles on gzip forces download of the whole file when length is accessed');
      }
      this._length = datalength;
      this._chunkSize = chunkSize;
      this.lengthKnown = true;
    };
    if (typeof XMLHttpRequest != 'undefined') {
      if (!ENVIRONMENT_IS_WORKER)
        throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
      var lazyArray = new LazyUint8Array();
      Object.defineProperties(lazyArray, {
        length: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          },
        },
        chunkSize: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          },
        },
      });
      var properties = { isDevice: false, contents: lazyArray };
    } else {
      var properties = { isDevice: false, url: url };
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    Object.defineProperties(node, {
      usedBytes: {
        get: function () {
          return this.contents.length;
        },
      },
    });
    var stream_ops = {};
    var keys = Object.keys(node.stream_ops);
    keys.forEach((key) => {
      var fn = node.stream_ops[key];
      stream_ops[key] = function forceLoadLazyFile() {
        FS.forceLoadFile(node);
        return fn.apply(null, arguments);
      };
    });
    function writeChunks(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      if (contents.slice) {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    }
    stream_ops.read = (stream, buffer, offset, length, position) => {
      FS.forceLoadFile(node);
      return writeChunks(stream, buffer, offset, length, position);
    };
    stream_ops.mmap = (stream, length, position, prot, flags) => {
      FS.forceLoadFile(node);
      var ptr = mmapAlloc(length);
      if (!ptr) {
        throw new FS.ErrnoError(48);
      }
      writeChunks(stream, HEAP8, ptr, length, position);
      return { ptr: ptr, allocated: true };
    };
    node.stream_ops = stream_ops;
    return node;
  },
  createPreloadedFile: (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
    var dep = getUniqueRunDependency('cp ' + fullname);
    function processData(byteArray) {
      function finish(byteArray) {
        if (preFinish) preFinish();
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        }
        if (onload) onload();
        removeRunDependency(dep);
      }
      if (
        Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
          if (onerror) onerror();
          removeRunDependency(dep);
        })
      ) {
        return;
      }
      finish(byteArray);
    }
    addRunDependency(dep);
    if (typeof url == 'string') {
      asyncLoad(url, (byteArray) => processData(byteArray), onerror);
    } else {
      processData(url);
    }
  },
  indexedDB: () => {
    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  },
  DB_NAME: () => {
    return 'EM_FS_' + window.location.pathname;
  },
  DB_VERSION: 20,
  DB_STORE_NAME: 'FILE_DATA',
  saveFilesToDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = () => {
      out('creating db');
      var db = openRequest.result;
      db.createObjectStore(FS.DB_STORE_NAME);
    };
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach((path) => {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path);
        putRequest.onsuccess = () => {
          ok++;
          if (ok + fail == total) finish();
        };
        putRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
  loadFilesFromDB: (paths, onload, onerror) => {
    onload = onload || (() => {});
    onerror = onerror || (() => {});
    var indexedDB = FS.indexedDB();
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
    } catch (e) {
      return onerror(e);
    }
    openRequest.onupgradeneeded = onerror;
    openRequest.onsuccess = () => {
      var db = openRequest.result;
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
      } catch (e) {
        onerror(e);
        return;
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME);
      var ok = 0,
        fail = 0,
        total = paths.length;
      function finish() {
        if (fail == 0) onload();
        else onerror();
      }
      paths.forEach((path) => {
        var getRequest = files.get(path);
        getRequest.onsuccess = () => {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path);
          }
          FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
          ok++;
          if (ok + fail == total) finish();
        };
        getRequest.onerror = () => {
          fail++;
          if (ok + fail == total) finish();
        };
      });
      transaction.onerror = onerror;
    };
    openRequest.onerror = onerror;
  },
};
var SYSCALLS = {
  DEFAULT_POLLMASK: 5,
  calculateAt: function (dirfd, path, allowEmpty) {
    if (PATH.isAbs(path)) {
      return path;
    }
    var dir;
    if (dirfd === -100) {
      dir = FS.cwd();
    } else {
      var dirstream = FS.getStream(dirfd);
      if (!dirstream) throw new FS.ErrnoError(8);
      dir = dirstream.path;
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44);
      }
      return dir;
    }
    return PATH.join2(dir, path);
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path);
    } catch (e) {
      if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
        return -54;
      }
      throw e;
    }
    HEAP32[buf >> 2] = stat.dev;
    HEAP32[(buf + 4) >> 2] = 0;
    HEAP32[(buf + 8) >> 2] = stat.ino;
    HEAP32[(buf + 12) >> 2] = stat.mode;
    HEAP32[(buf + 16) >> 2] = stat.nlink;
    HEAP32[(buf + 20) >> 2] = stat.uid;
    HEAP32[(buf + 24) >> 2] = stat.gid;
    HEAP32[(buf + 28) >> 2] = stat.rdev;
    HEAP32[(buf + 32) >> 2] = 0;
    (tempI64 = [
      stat.size >>> 0,
      ((tempDouble = stat.size),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0),
    ]),
      (HEAP32[(buf + 40) >> 2] = tempI64[0]),
      (HEAP32[(buf + 44) >> 2] = tempI64[1]);
    HEAP32[(buf + 48) >> 2] = 4096;
    HEAP32[(buf + 52) >> 2] = stat.blocks;
    HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0;
    HEAP32[(buf + 60) >> 2] = 0;
    HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0;
    HEAP32[(buf + 68) >> 2] = 0;
    HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0;
    HEAP32[(buf + 76) >> 2] = 0;
    (tempI64 = [
      stat.ino >>> 0,
      ((tempDouble = stat.ino),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0),
    ]),
      (HEAP32[(buf + 80) >> 2] = tempI64[0]),
      (HEAP32[(buf + 84) >> 2] = tempI64[1]);
    return 0;
  },
  doMsync: function (addr, stream, len, flags, offset) {
    var buffer = HEAPU8.slice(addr, addr + len);
    FS.msync(stream, buffer, offset, len, flags);
  },
  varargs: undefined,
  get: function () {
    SYSCALLS.varargs += 4;
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function (ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  },
  getStreamFromFD: function (fd) {
    var stream = FS.getStream(fd);
    if (!stream) throw new FS.ErrnoError(8);
    return stream;
  },
};
function ___syscall_chmod(path, mode) {
  try {
    path = SYSCALLS.getStr(path);
    FS.chmod(path, mode);
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_faccessat(dirfd, path, amode, flags) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (amode & ~7) {
      return -28;
    }
    var lookup = FS.lookupPath(path, { follow: true });
    var node = lookup.node;
    if (!node) {
      return -44;
    }
    var perms = '';
    if (amode & 4) perms += 'r';
    if (amode & 2) perms += 'w';
    if (amode & 1) perms += 'x';
    if (perms && FS.nodePermissions(node, perms)) {
      return -2;
    }
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function setErrNo(value) {
  HEAP32[___errno_location() >> 2] = value;
  return value;
}
function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
      case 0: {
        var arg = SYSCALLS.get();
        if (arg < 0) {
          return -28;
        }
        var newStream;
        newStream = FS.createStream(stream, arg);
        return newStream.fd;
      }
      case 1:
      case 2:
        return 0;
      case 3:
        return stream.flags;
      case 4: {
        var arg = SYSCALLS.get();
        stream.flags |= arg;
        return 0;
      }
      case 5: {
        var arg = SYSCALLS.get();
        var offset = 0;
        HEAP16[(arg + offset) >> 1] = 2;
        return 0;
      }
      case 6:
      case 7:
        return 0;
      case 16:
      case 8:
        return -28;
      case 9:
        setErrNo(28);
        return -1;
      default: {
        return -28;
      }
    }
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_fstat64(fd, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return SYSCALLS.doStat(FS.stat, stream.path, buf);
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_statfs64(path, size, buf) {
  try {
    path = SYSCALLS.getStr(path);
    HEAP32[(buf + 4) >> 2] = 4096;
    HEAP32[(buf + 40) >> 2] = 4096;
    HEAP32[(buf + 8) >> 2] = 1e6;
    HEAP32[(buf + 12) >> 2] = 5e5;
    HEAP32[(buf + 16) >> 2] = 5e5;
    HEAP32[(buf + 20) >> 2] = FS.nextInode;
    HEAP32[(buf + 24) >> 2] = 1e6;
    HEAP32[(buf + 28) >> 2] = 42;
    HEAP32[(buf + 44) >> 2] = 2;
    HEAP32[(buf + 36) >> 2] = 255;
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_fstatfs64(fd, size, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    return ___syscall_statfs64(0, size, buf);
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_getcwd(buf, size) {
  try {
    if (size === 0) return -28;
    var cwd = FS.cwd();
    var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
    if (size < cwdLengthInBytes) return -68;
    stringToUTF8(cwd, buf, size);
    return cwdLengthInBytes;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_getdents64(fd, dirp, count) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    if (!stream.getdents) {
      stream.getdents = FS.readdir(stream.path);
    }
    var struct_size = 280;
    var pos = 0;
    var off = FS.llseek(stream, 0, 1);
    var idx = Math.floor(off / struct_size);
    while (idx < stream.getdents.length && pos + struct_size <= count) {
      var id;
      var type;
      var name = stream.getdents[idx];
      if (name === '.') {
        id = stream.node.id;
        type = 4;
      } else if (name === '..') {
        var lookup = FS.lookupPath(stream.path, { parent: true });
        id = lookup.node.id;
        type = 4;
      } else {
        var child = FS.lookupNode(stream.node, name);
        id = child.id;
        type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
      }
      (tempI64 = [
        id >>> 0,
        ((tempDouble = id),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1]);
      (tempI64 = [
        ((idx + 1) * struct_size) >>> 0,
        ((tempDouble = (idx + 1) * struct_size),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0),
      ]),
        (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1]);
      HEAP16[(dirp + pos + 16) >> 1] = 280;
      HEAP8[(dirp + pos + 18) >> 0] = type;
      stringToUTF8(name, dirp + pos + 19, 256);
      pos += struct_size;
      idx += 1;
    }
    FS.llseek(stream, idx * struct_size, 0);
    return pos;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
      case 21509:
      case 21505: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21519: {
        if (!stream.tty) return -59;
        var argp = SYSCALLS.get();
        HEAP32[argp >> 2] = 0;
        return 0;
      }
      case 21520: {
        if (!stream.tty) return -59;
        return -28;
      }
      case 21531: {
        var argp = SYSCALLS.get();
        return FS.ioctl(stream, op, argp);
      }
      case 21523: {
        if (!stream.tty) return -59;
        return 0;
      }
      case 21524: {
        if (!stream.tty) return -59;
        return 0;
      }
      default:
        abort('bad ioctl syscall ' + op);
    }
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_lstat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.lstat, path, buf);
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_mkdirat(dirfd, path, mode) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    path = PATH.normalize(path);
    if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1);
    FS.mkdir(path, mode, 0);
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_newfstatat(dirfd, path, buf, flags) {
  try {
    path = SYSCALLS.getStr(path);
    var nofollow = flags & 256;
    var allowEmpty = flags & 4096;
    flags = flags & ~4352;
    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
    return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_openat(dirfd, path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    var mode = varargs ? SYSCALLS.get() : 0;
    return FS.open(path, flags, mode).fd;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (bufsize <= 0) return -28;
    var ret = FS.readlink(path);
    var len = Math.min(bufsize, lengthBytesUTF8(ret));
    var endChar = HEAP8[buf + len];
    stringToUTF8(ret, buf, bufsize + 1);
    HEAP8[buf + len] = endChar;
    return len;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
  try {
    oldpath = SYSCALLS.getStr(oldpath);
    newpath = SYSCALLS.getStr(newpath);
    oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
    newpath = SYSCALLS.calculateAt(newdirfd, newpath);
    FS.rename(oldpath, newpath);
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_rmdir(path) {
  try {
    path = SYSCALLS.getStr(path);
    FS.rmdir(path);
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_stat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path);
    return SYSCALLS.doStat(FS.stat, path, buf);
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_symlink(target, linkpath) {
  try {
    target = SYSCALLS.getStr(target);
    linkpath = SYSCALLS.getStr(linkpath);
    FS.symlink(target, linkpath);
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function ___syscall_unlinkat(dirfd, path, flags) {
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    if (flags === 0) {
      FS.unlink(path);
    } else if (flags === 512) {
      FS.rmdir(path);
    } else {
      abort('Invalid flags passed to unlinkat');
    }
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
}
function __emscripten_date_now() {
  return Date.now;
}
function __emscripten_fs_load_embedded_files(ptr) {
  do {
    var name_addr = HEAPU32[ptr >> 2];
    ptr += 4;
    var len = HEAPU32[ptr >> 2];
    ptr += 4;
    var content = HEAPU32[ptr >> 2];
    ptr += 4;
    var name = UTF8ToString(name_addr);
    FS.createPath('/', PATH.dirname(name), true, true);
    FS.createDataFile(name, null, HEAP8.subarray(content, content + len), true, true, true);
  } while (HEAPU32[ptr >> 2]);
}
var nowIsMonotonic = true;
function __emscripten_get_now_is_monotonic() {
  return nowIsMonotonic;
}
function __emscripten_throw_longjmp() {
  throw Infinity;
}
function _abort() {
  abort('');
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num);
}
function getHeapMax() {
  return 2147483648;
}
function emscripten_realloc_buffer(size) {
  try {
    wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16);
    updateGlobalBufferAndViews(wasmMemory.buffer);
    return 1;
  } catch (e) {}
}
function _emscripten_resize_heap(requestedSize) {
  var oldSize = HEAPU8.length;
  requestedSize = requestedSize >>> 0;
  var maxHeapSize = getHeapMax();
  if (requestedSize > maxHeapSize) {
    return false;
  }
  let alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = emscripten_realloc_buffer(newSize);
    if (replacement) {
      return true;
    }
  }
  return false;
}
var ENV = {};
function getExecutableName() {
  return thisProgram || './this.program';
}
function getEnvStrings() {
  if (!getEnvStrings.strings) {
    var lang =
      ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') +
      '.UTF-8';
    var env = {
      USER: 'web_user',
      LOGNAME: 'web_user',
      PATH: '/',
      PWD: '/',
      HOME: '/home/web_user',
      LANG: lang,
      _: getExecutableName(),
    };
    for (var x in ENV) {
      if (ENV[x] === undefined) delete env[x];
      else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(x + '=' + env[x]);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
}
function _environ_get(__environ, environ_buf) {
  var bufSize = 0;
  getEnvStrings().forEach(function (string, i) {
    var ptr = environ_buf + bufSize;
    HEAPU32[(__environ + i * 4) >> 2] = ptr;
    writeAsciiToMemory(string, ptr);
    bufSize += string.length + 1;
  });
  return 0;
}
function _environ_sizes_get(penviron_count, penviron_buf_size) {
  var strings = getEnvStrings();
  HEAPU32[penviron_count >> 2] = strings.length;
  var bufSize = 0;
  strings.forEach(function (string) {
    bufSize += string.length + 1;
  });
  HEAPU32[penviron_buf_size >> 2] = bufSize;
  return 0;
}
function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function doReadv(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    var curr = FS.read(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) break;
  }
  return ret;
}
function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doReadv(stream, iov, iovcnt);
    HEAP32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function convertI32PairToI53Checked(lo, hi) {
  return (hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
    if (isNaN(offset)) return 61;
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.llseek(stream, offset, whence);
    (tempI64 = [
      stream.position >>> 0,
      ((tempDouble = stream.position),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0),
    ]),
      (HEAP32[newOffset >> 2] = tempI64[0]),
      (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function doWritev(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[iov >> 2];
    var len = HEAPU32[(iov + 4) >> 2];
    iov += 8;
    var curr = FS.write(stream, HEAP8, ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
  }
  return ret;
}
function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doWritev(stream, iov, iovcnt);
    HEAPU32[pnum >> 2] = num;
    return 0;
  } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
}
function _getTempRet0() {
  return getTempRet0();
}
function _setTempRet0(val) {
  setTempRet0(val);
}
Module['requestFullscreen'] = function Module_requestFullscreen(lockPointer, resizeCanvas) {
  Browser.requestFullscreen(lockPointer, resizeCanvas);
};
Module['requestAnimationFrame'] = function Module_requestAnimationFrame(func) {
  Browser.requestAnimationFrame(func);
};
Module['setCanvasSize'] = function Module_setCanvasSize(width, height, noUpdates) {
  Browser.setCanvasSize(width, height, noUpdates);
};
Module['pauseMainLoop'] = function Module_pauseMainLoop() {
  Browser.mainLoop.pause();
};
Module['resumeMainLoop'] = function Module_resumeMainLoop() {
  Browser.mainLoop.resume();
};
Module['getUserMedia'] = function Module_getUserMedia() {
  Browser.getUserMedia();
};
Module['createContext'] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
  return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};
var preloadedImages = {};
var preloadedAudios = {};
var FSNode = function (parent, name, mode, rdev) {
  if (!parent) {
    parent = this;
  }
  this.parent = parent;
  this.mount = parent.mount;
  this.mounted = null;
  this.id = FS.nextInode++;
  this.name = name;
  this.mode = mode;
  this.node_ops = {};
  this.stream_ops = {};
  this.rdev = rdev;
};
var readMode = 292 | 73;
var writeMode = 146;
Object.defineProperties(FSNode.prototype, {
  read: {
    get: function () {
      return (this.mode & readMode) === readMode;
    },
    set: function (val) {
      val ? (this.mode |= readMode) : (this.mode &= ~readMode);
    },
  },
  write: {
    get: function () {
      return (this.mode & writeMode) === writeMode;
    },
    set: function (val) {
      val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
    },
  },
  isFolder: {
    get: function () {
      return FS.isDir(this.mode);
    },
  },
  isDevice: {
    get: function () {
      return FS.isChrdev(this.mode);
    },
  },
});
FS.FSNode = FSNode;
FS.staticInit();
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
Module['FS_createPath'] = FS.createPath;
Module['FS_createPath'] = FS.createPath;
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
Module['FS_unlink'] = FS.unlink;
Module['FS_createLazyFile'] = FS.createLazyFile;
Module['FS_createDevice'] = FS.createDevice;
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
var asmLibraryArg = {
  a: ___assert_fail,
  L: ___syscall_chmod,
  M: ___syscall_faccessat,
  f: ___syscall_fcntl64,
  I: ___syscall_fstat64,
  w: ___syscall_fstatfs64,
  E: ___syscall_getcwd,
  A: ___syscall_getdents64,
  n: ___syscall_ioctl,
  G: ___syscall_lstat64,
  B: ___syscall_mkdirat,
  F: ___syscall_newfstatat,
  l: ___syscall_openat,
  z: ___syscall_readlinkat,
  y: ___syscall_renameat,
  x: ___syscall_rmdir,
  H: ___syscall_stat64,
  v: ___syscall_symlink,
  u: ___syscall_unlinkat,
  i: __emscripten_date_now,
  o: __emscripten_fs_load_embedded_files,
  J: __emscripten_get_now_is_monotonic,
  t: __emscripten_throw_longjmp,
  h: _abort,
  m: _emscripten_get_now,
  K: _emscripten_memcpy_big,
  g: _emscripten_resize_heap,
  C: _environ_get,
  D: _environ_sizes_get,
  e: _exit,
  d: _fd_close,
  k: _fd_read,
  p: _fd_seek,
  j: _fd_write,
  c: _getTempRet0,
  s: invoke_iii,
  q: invoke_iiii,
  r: invoke_iiiii,
  b: _setTempRet0,
};
var asm = createWasm();
var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
  return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['O']).apply(null, arguments);
});
var _main = (Module['_main'] = function () {
  return (_main = Module['_main'] = Module['asm']['P']).apply(null, arguments);
});
var _emscripten_bind_VoidPtr___destroy___0 = (Module['_emscripten_bind_VoidPtr___destroy___0'] = function () {
  return (_emscripten_bind_VoidPtr___destroy___0 = Module['_emscripten_bind_VoidPtr___destroy___0'] =
    Module['asm']['Q']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_get_w_0 = (Module['_emscripten_bind_ASS_Image_get_w_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_w_0 = Module['_emscripten_bind_ASS_Image_get_w_0'] = Module['asm']['R']).apply(
    null,
    arguments
  );
});
var _emscripten_bind_ASS_Image_set_w_1 = (Module['_emscripten_bind_ASS_Image_set_w_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_w_1 = Module['_emscripten_bind_ASS_Image_set_w_1'] = Module['asm']['S']).apply(
    null,
    arguments
  );
});
var _emscripten_bind_ASS_Image_get_h_0 = (Module['_emscripten_bind_ASS_Image_get_h_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_h_0 = Module['_emscripten_bind_ASS_Image_get_h_0'] = Module['asm']['T']).apply(
    null,
    arguments
  );
});
var _emscripten_bind_ASS_Image_set_h_1 = (Module['_emscripten_bind_ASS_Image_set_h_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_h_1 = Module['_emscripten_bind_ASS_Image_set_h_1'] = Module['asm']['U']).apply(
    null,
    arguments
  );
});
var _emscripten_bind_ASS_Image_get_stride_0 = (Module['_emscripten_bind_ASS_Image_get_stride_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_stride_0 = Module['_emscripten_bind_ASS_Image_get_stride_0'] =
    Module['asm']['V']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_set_stride_1 = (Module['_emscripten_bind_ASS_Image_set_stride_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_stride_1 = Module['_emscripten_bind_ASS_Image_set_stride_1'] =
    Module['asm']['W']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_get_bitmap_0 = (Module['_emscripten_bind_ASS_Image_get_bitmap_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_bitmap_0 = Module['_emscripten_bind_ASS_Image_get_bitmap_0'] =
    Module['asm']['X']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_set_bitmap_1 = (Module['_emscripten_bind_ASS_Image_set_bitmap_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_bitmap_1 = Module['_emscripten_bind_ASS_Image_set_bitmap_1'] =
    Module['asm']['Y']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_get_color_0 = (Module['_emscripten_bind_ASS_Image_get_color_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_color_0 = Module['_emscripten_bind_ASS_Image_get_color_0'] =
    Module['asm']['Z']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_set_color_1 = (Module['_emscripten_bind_ASS_Image_set_color_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_color_1 = Module['_emscripten_bind_ASS_Image_set_color_1'] =
    Module['asm']['_']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_get_dst_x_0 = (Module['_emscripten_bind_ASS_Image_get_dst_x_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_dst_x_0 = Module['_emscripten_bind_ASS_Image_get_dst_x_0'] =
    Module['asm']['$']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_set_dst_x_1 = (Module['_emscripten_bind_ASS_Image_set_dst_x_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_dst_x_1 = Module['_emscripten_bind_ASS_Image_set_dst_x_1'] =
    Module['asm']['aa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_get_dst_y_0 = (Module['_emscripten_bind_ASS_Image_get_dst_y_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_dst_y_0 = Module['_emscripten_bind_ASS_Image_get_dst_y_0'] =
    Module['asm']['ba']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_set_dst_y_1 = (Module['_emscripten_bind_ASS_Image_set_dst_y_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_dst_y_1 = Module['_emscripten_bind_ASS_Image_set_dst_y_1'] =
    Module['asm']['ca']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_get_next_0 = (Module['_emscripten_bind_ASS_Image_get_next_0'] = function () {
  return (_emscripten_bind_ASS_Image_get_next_0 = Module['_emscripten_bind_ASS_Image_get_next_0'] =
    Module['asm']['da']).apply(null, arguments);
});
var _emscripten_bind_ASS_Image_set_next_1 = (Module['_emscripten_bind_ASS_Image_set_next_1'] = function () {
  return (_emscripten_bind_ASS_Image_set_next_1 = Module['_emscripten_bind_ASS_Image_set_next_1'] =
    Module['asm']['ea']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Name_0 = (Module['_emscripten_bind_ASS_Style_get_Name_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Name_0 = Module['_emscripten_bind_ASS_Style_get_Name_0'] =
    Module['asm']['fa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Name_1 = (Module['_emscripten_bind_ASS_Style_set_Name_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Name_1 = Module['_emscripten_bind_ASS_Style_set_Name_1'] =
    Module['asm']['ga']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_FontName_0 = (Module['_emscripten_bind_ASS_Style_get_FontName_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_FontName_0 = Module['_emscripten_bind_ASS_Style_get_FontName_0'] =
    Module['asm']['ha']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_FontName_1 = (Module['_emscripten_bind_ASS_Style_set_FontName_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_FontName_1 = Module['_emscripten_bind_ASS_Style_set_FontName_1'] =
    Module['asm']['ia']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_FontSize_0 = (Module['_emscripten_bind_ASS_Style_get_FontSize_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_FontSize_0 = Module['_emscripten_bind_ASS_Style_get_FontSize_0'] =
    Module['asm']['ja']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_FontSize_1 = (Module['_emscripten_bind_ASS_Style_set_FontSize_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_FontSize_1 = Module['_emscripten_bind_ASS_Style_set_FontSize_1'] =
    Module['asm']['ka']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_PrimaryColour_0 = (Module['_emscripten_bind_ASS_Style_get_PrimaryColour_0'] =
  function () {
    return (_emscripten_bind_ASS_Style_get_PrimaryColour_0 = Module['_emscripten_bind_ASS_Style_get_PrimaryColour_0'] =
      Module['asm']['la']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_set_PrimaryColour_1 = (Module['_emscripten_bind_ASS_Style_set_PrimaryColour_1'] =
  function () {
    return (_emscripten_bind_ASS_Style_set_PrimaryColour_1 = Module['_emscripten_bind_ASS_Style_set_PrimaryColour_1'] =
      Module['asm']['ma']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_get_SecondaryColour_0 = (Module['_emscripten_bind_ASS_Style_get_SecondaryColour_0'] =
  function () {
    return (_emscripten_bind_ASS_Style_get_SecondaryColour_0 = Module[
      '_emscripten_bind_ASS_Style_get_SecondaryColour_0'
    ] =
      Module['asm']['na']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_set_SecondaryColour_1 = (Module['_emscripten_bind_ASS_Style_set_SecondaryColour_1'] =
  function () {
    return (_emscripten_bind_ASS_Style_set_SecondaryColour_1 = Module[
      '_emscripten_bind_ASS_Style_set_SecondaryColour_1'
    ] =
      Module['asm']['oa']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_get_OutlineColour_0 = (Module['_emscripten_bind_ASS_Style_get_OutlineColour_0'] =
  function () {
    return (_emscripten_bind_ASS_Style_get_OutlineColour_0 = Module['_emscripten_bind_ASS_Style_get_OutlineColour_0'] =
      Module['asm']['pa']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_set_OutlineColour_1 = (Module['_emscripten_bind_ASS_Style_set_OutlineColour_1'] =
  function () {
    return (_emscripten_bind_ASS_Style_set_OutlineColour_1 = Module['_emscripten_bind_ASS_Style_set_OutlineColour_1'] =
      Module['asm']['qa']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_get_BackColour_0 = (Module['_emscripten_bind_ASS_Style_get_BackColour_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_BackColour_0 = Module['_emscripten_bind_ASS_Style_get_BackColour_0'] =
    Module['asm']['ra']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_BackColour_1 = (Module['_emscripten_bind_ASS_Style_set_BackColour_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_BackColour_1 = Module['_emscripten_bind_ASS_Style_set_BackColour_1'] =
    Module['asm']['sa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Bold_0 = (Module['_emscripten_bind_ASS_Style_get_Bold_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Bold_0 = Module['_emscripten_bind_ASS_Style_get_Bold_0'] =
    Module['asm']['ta']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Bold_1 = (Module['_emscripten_bind_ASS_Style_set_Bold_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Bold_1 = Module['_emscripten_bind_ASS_Style_set_Bold_1'] =
    Module['asm']['ua']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Italic_0 = (Module['_emscripten_bind_ASS_Style_get_Italic_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Italic_0 = Module['_emscripten_bind_ASS_Style_get_Italic_0'] =
    Module['asm']['va']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Italic_1 = (Module['_emscripten_bind_ASS_Style_set_Italic_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Italic_1 = Module['_emscripten_bind_ASS_Style_set_Italic_1'] =
    Module['asm']['wa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Underline_0 = (Module['_emscripten_bind_ASS_Style_get_Underline_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Underline_0 = Module['_emscripten_bind_ASS_Style_get_Underline_0'] =
    Module['asm']['xa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Underline_1 = (Module['_emscripten_bind_ASS_Style_set_Underline_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Underline_1 = Module['_emscripten_bind_ASS_Style_set_Underline_1'] =
    Module['asm']['ya']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_StrikeOut_0 = (Module['_emscripten_bind_ASS_Style_get_StrikeOut_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_StrikeOut_0 = Module['_emscripten_bind_ASS_Style_get_StrikeOut_0'] =
    Module['asm']['za']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_StrikeOut_1 = (Module['_emscripten_bind_ASS_Style_set_StrikeOut_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_StrikeOut_1 = Module['_emscripten_bind_ASS_Style_set_StrikeOut_1'] =
    Module['asm']['Aa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_ScaleX_0 = (Module['_emscripten_bind_ASS_Style_get_ScaleX_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_ScaleX_0 = Module['_emscripten_bind_ASS_Style_get_ScaleX_0'] =
    Module['asm']['Ba']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_ScaleX_1 = (Module['_emscripten_bind_ASS_Style_set_ScaleX_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_ScaleX_1 = Module['_emscripten_bind_ASS_Style_set_ScaleX_1'] =
    Module['asm']['Ca']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_ScaleY_0 = (Module['_emscripten_bind_ASS_Style_get_ScaleY_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_ScaleY_0 = Module['_emscripten_bind_ASS_Style_get_ScaleY_0'] =
    Module['asm']['Da']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_ScaleY_1 = (Module['_emscripten_bind_ASS_Style_set_ScaleY_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_ScaleY_1 = Module['_emscripten_bind_ASS_Style_set_ScaleY_1'] =
    Module['asm']['Ea']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Spacing_0 = (Module['_emscripten_bind_ASS_Style_get_Spacing_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Spacing_0 = Module['_emscripten_bind_ASS_Style_get_Spacing_0'] =
    Module['asm']['Fa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Spacing_1 = (Module['_emscripten_bind_ASS_Style_set_Spacing_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Spacing_1 = Module['_emscripten_bind_ASS_Style_set_Spacing_1'] =
    Module['asm']['Ga']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Angle_0 = (Module['_emscripten_bind_ASS_Style_get_Angle_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Angle_0 = Module['_emscripten_bind_ASS_Style_get_Angle_0'] =
    Module['asm']['Ha']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Angle_1 = (Module['_emscripten_bind_ASS_Style_set_Angle_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Angle_1 = Module['_emscripten_bind_ASS_Style_set_Angle_1'] =
    Module['asm']['Ia']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_BorderStyle_0 = (Module['_emscripten_bind_ASS_Style_get_BorderStyle_0'] =
  function () {
    return (_emscripten_bind_ASS_Style_get_BorderStyle_0 = Module['_emscripten_bind_ASS_Style_get_BorderStyle_0'] =
      Module['asm']['Ja']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_set_BorderStyle_1 = (Module['_emscripten_bind_ASS_Style_set_BorderStyle_1'] =
  function () {
    return (_emscripten_bind_ASS_Style_set_BorderStyle_1 = Module['_emscripten_bind_ASS_Style_set_BorderStyle_1'] =
      Module['asm']['Ka']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Style_get_Outline_0 = (Module['_emscripten_bind_ASS_Style_get_Outline_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Outline_0 = Module['_emscripten_bind_ASS_Style_get_Outline_0'] =
    Module['asm']['La']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Outline_1 = (Module['_emscripten_bind_ASS_Style_set_Outline_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Outline_1 = Module['_emscripten_bind_ASS_Style_set_Outline_1'] =
    Module['asm']['Ma']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Shadow_0 = (Module['_emscripten_bind_ASS_Style_get_Shadow_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Shadow_0 = Module['_emscripten_bind_ASS_Style_get_Shadow_0'] =
    Module['asm']['Na']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Shadow_1 = (Module['_emscripten_bind_ASS_Style_set_Shadow_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Shadow_1 = Module['_emscripten_bind_ASS_Style_set_Shadow_1'] =
    Module['asm']['Oa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Alignment_0 = (Module['_emscripten_bind_ASS_Style_get_Alignment_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Alignment_0 = Module['_emscripten_bind_ASS_Style_get_Alignment_0'] =
    Module['asm']['Pa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Alignment_1 = (Module['_emscripten_bind_ASS_Style_set_Alignment_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Alignment_1 = Module['_emscripten_bind_ASS_Style_set_Alignment_1'] =
    Module['asm']['Qa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_MarginL_0 = (Module['_emscripten_bind_ASS_Style_get_MarginL_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_MarginL_0 = Module['_emscripten_bind_ASS_Style_get_MarginL_0'] =
    Module['asm']['Ra']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_MarginL_1 = (Module['_emscripten_bind_ASS_Style_set_MarginL_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_MarginL_1 = Module['_emscripten_bind_ASS_Style_set_MarginL_1'] =
    Module['asm']['Sa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_MarginR_0 = (Module['_emscripten_bind_ASS_Style_get_MarginR_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_MarginR_0 = Module['_emscripten_bind_ASS_Style_get_MarginR_0'] =
    Module['asm']['Ta']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_MarginR_1 = (Module['_emscripten_bind_ASS_Style_set_MarginR_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_MarginR_1 = Module['_emscripten_bind_ASS_Style_set_MarginR_1'] =
    Module['asm']['Ua']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_MarginV_0 = (Module['_emscripten_bind_ASS_Style_get_MarginV_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_MarginV_0 = Module['_emscripten_bind_ASS_Style_get_MarginV_0'] =
    Module['asm']['Va']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_MarginV_1 = (Module['_emscripten_bind_ASS_Style_set_MarginV_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_MarginV_1 = Module['_emscripten_bind_ASS_Style_set_MarginV_1'] =
    Module['asm']['Wa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Encoding_0 = (Module['_emscripten_bind_ASS_Style_get_Encoding_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Encoding_0 = Module['_emscripten_bind_ASS_Style_get_Encoding_0'] =
    Module['asm']['Xa']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Encoding_1 = (Module['_emscripten_bind_ASS_Style_set_Encoding_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Encoding_1 = Module['_emscripten_bind_ASS_Style_set_Encoding_1'] =
    Module['asm']['Ya']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0 = (Module[
  '_emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0'
] = function () {
  return (_emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0 = Module[
    '_emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0'
  ] =
    Module['asm']['Za']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1 = (Module[
  '_emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1'
] = function () {
  return (_emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1 = Module[
    '_emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1'
  ] =
    Module['asm']['_a']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Blur_0 = (Module['_emscripten_bind_ASS_Style_get_Blur_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Blur_0 = Module['_emscripten_bind_ASS_Style_get_Blur_0'] =
    Module['asm']['$a']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Blur_1 = (Module['_emscripten_bind_ASS_Style_set_Blur_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Blur_1 = Module['_emscripten_bind_ASS_Style_set_Blur_1'] =
    Module['asm']['ab']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_get_Justify_0 = (Module['_emscripten_bind_ASS_Style_get_Justify_0'] = function () {
  return (_emscripten_bind_ASS_Style_get_Justify_0 = Module['_emscripten_bind_ASS_Style_get_Justify_0'] =
    Module['asm']['bb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Style_set_Justify_1 = (Module['_emscripten_bind_ASS_Style_set_Justify_1'] = function () {
  return (_emscripten_bind_ASS_Style_set_Justify_1 = Module['_emscripten_bind_ASS_Style_set_Justify_1'] =
    Module['asm']['cb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_Start_0 = (Module['_emscripten_bind_ASS_Event_get_Start_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_Start_0 = Module['_emscripten_bind_ASS_Event_get_Start_0'] =
    Module['asm']['db']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_Start_1 = (Module['_emscripten_bind_ASS_Event_set_Start_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_Start_1 = Module['_emscripten_bind_ASS_Event_set_Start_1'] =
    Module['asm']['eb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_Duration_0 = (Module['_emscripten_bind_ASS_Event_get_Duration_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_Duration_0 = Module['_emscripten_bind_ASS_Event_get_Duration_0'] =
    Module['asm']['fb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_Duration_1 = (Module['_emscripten_bind_ASS_Event_set_Duration_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_Duration_1 = Module['_emscripten_bind_ASS_Event_set_Duration_1'] =
    Module['asm']['gb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_ReadOrder_0 = (Module['_emscripten_bind_ASS_Event_get_ReadOrder_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_ReadOrder_0 = Module['_emscripten_bind_ASS_Event_get_ReadOrder_0'] =
    Module['asm']['hb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_ReadOrder_1 = (Module['_emscripten_bind_ASS_Event_set_ReadOrder_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_ReadOrder_1 = Module['_emscripten_bind_ASS_Event_set_ReadOrder_1'] =
    Module['asm']['ib']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_Layer_0 = (Module['_emscripten_bind_ASS_Event_get_Layer_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_Layer_0 = Module['_emscripten_bind_ASS_Event_get_Layer_0'] =
    Module['asm']['jb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_Layer_1 = (Module['_emscripten_bind_ASS_Event_set_Layer_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_Layer_1 = Module['_emscripten_bind_ASS_Event_set_Layer_1'] =
    Module['asm']['kb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_Style_0 = (Module['_emscripten_bind_ASS_Event_get_Style_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_Style_0 = Module['_emscripten_bind_ASS_Event_get_Style_0'] =
    Module['asm']['lb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_Style_1 = (Module['_emscripten_bind_ASS_Event_set_Style_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_Style_1 = Module['_emscripten_bind_ASS_Event_set_Style_1'] =
    Module['asm']['mb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_Name_0 = (Module['_emscripten_bind_ASS_Event_get_Name_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_Name_0 = Module['_emscripten_bind_ASS_Event_get_Name_0'] =
    Module['asm']['nb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_Name_1 = (Module['_emscripten_bind_ASS_Event_set_Name_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_Name_1 = Module['_emscripten_bind_ASS_Event_set_Name_1'] =
    Module['asm']['ob']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_MarginL_0 = (Module['_emscripten_bind_ASS_Event_get_MarginL_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_MarginL_0 = Module['_emscripten_bind_ASS_Event_get_MarginL_0'] =
    Module['asm']['pb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_MarginL_1 = (Module['_emscripten_bind_ASS_Event_set_MarginL_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_MarginL_1 = Module['_emscripten_bind_ASS_Event_set_MarginL_1'] =
    Module['asm']['qb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_MarginR_0 = (Module['_emscripten_bind_ASS_Event_get_MarginR_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_MarginR_0 = Module['_emscripten_bind_ASS_Event_get_MarginR_0'] =
    Module['asm']['rb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_MarginR_1 = (Module['_emscripten_bind_ASS_Event_set_MarginR_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_MarginR_1 = Module['_emscripten_bind_ASS_Event_set_MarginR_1'] =
    Module['asm']['sb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_MarginV_0 = (Module['_emscripten_bind_ASS_Event_get_MarginV_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_MarginV_0 = Module['_emscripten_bind_ASS_Event_get_MarginV_0'] =
    Module['asm']['tb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_MarginV_1 = (Module['_emscripten_bind_ASS_Event_set_MarginV_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_MarginV_1 = Module['_emscripten_bind_ASS_Event_set_MarginV_1'] =
    Module['asm']['ub']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_Effect_0 = (Module['_emscripten_bind_ASS_Event_get_Effect_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_Effect_0 = Module['_emscripten_bind_ASS_Event_get_Effect_0'] =
    Module['asm']['vb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_Effect_1 = (Module['_emscripten_bind_ASS_Event_set_Effect_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_Effect_1 = Module['_emscripten_bind_ASS_Event_set_Effect_1'] =
    Module['asm']['wb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_get_Text_0 = (Module['_emscripten_bind_ASS_Event_get_Text_0'] = function () {
  return (_emscripten_bind_ASS_Event_get_Text_0 = Module['_emscripten_bind_ASS_Event_get_Text_0'] =
    Module['asm']['xb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Event_set_Text_1 = (Module['_emscripten_bind_ASS_Event_set_Text_1'] = function () {
  return (_emscripten_bind_ASS_Event_set_Text_1 = Module['_emscripten_bind_ASS_Event_set_Text_1'] =
    Module['asm']['yb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_n_styles_0 = (Module['_emscripten_bind_ASS_Track_get_n_styles_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_n_styles_0 = Module['_emscripten_bind_ASS_Track_get_n_styles_0'] =
    Module['asm']['zb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_n_styles_1 = (Module['_emscripten_bind_ASS_Track_set_n_styles_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_n_styles_1 = Module['_emscripten_bind_ASS_Track_set_n_styles_1'] =
    Module['asm']['Ab']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_max_styles_0 = (Module['_emscripten_bind_ASS_Track_get_max_styles_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_max_styles_0 = Module['_emscripten_bind_ASS_Track_get_max_styles_0'] =
    Module['asm']['Bb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_max_styles_1 = (Module['_emscripten_bind_ASS_Track_set_max_styles_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_max_styles_1 = Module['_emscripten_bind_ASS_Track_set_max_styles_1'] =
    Module['asm']['Cb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_n_events_0 = (Module['_emscripten_bind_ASS_Track_get_n_events_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_n_events_0 = Module['_emscripten_bind_ASS_Track_get_n_events_0'] =
    Module['asm']['Db']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_n_events_1 = (Module['_emscripten_bind_ASS_Track_set_n_events_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_n_events_1 = Module['_emscripten_bind_ASS_Track_set_n_events_1'] =
    Module['asm']['Eb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_max_events_0 = (Module['_emscripten_bind_ASS_Track_get_max_events_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_max_events_0 = Module['_emscripten_bind_ASS_Track_get_max_events_0'] =
    Module['asm']['Fb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_max_events_1 = (Module['_emscripten_bind_ASS_Track_set_max_events_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_max_events_1 = Module['_emscripten_bind_ASS_Track_set_max_events_1'] =
    Module['asm']['Gb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_styles_1 = (Module['_emscripten_bind_ASS_Track_get_styles_1'] = function () {
  return (_emscripten_bind_ASS_Track_get_styles_1 = Module['_emscripten_bind_ASS_Track_get_styles_1'] =
    Module['asm']['Hb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_styles_2 = (Module['_emscripten_bind_ASS_Track_set_styles_2'] = function () {
  return (_emscripten_bind_ASS_Track_set_styles_2 = Module['_emscripten_bind_ASS_Track_set_styles_2'] =
    Module['asm']['Ib']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_events_1 = (Module['_emscripten_bind_ASS_Track_get_events_1'] = function () {
  return (_emscripten_bind_ASS_Track_get_events_1 = Module['_emscripten_bind_ASS_Track_get_events_1'] =
    Module['asm']['Jb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_events_2 = (Module['_emscripten_bind_ASS_Track_set_events_2'] = function () {
  return (_emscripten_bind_ASS_Track_set_events_2 = Module['_emscripten_bind_ASS_Track_set_events_2'] =
    Module['asm']['Kb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_style_format_0 = (Module['_emscripten_bind_ASS_Track_get_style_format_0'] =
  function () {
    return (_emscripten_bind_ASS_Track_get_style_format_0 = Module['_emscripten_bind_ASS_Track_get_style_format_0'] =
      Module['asm']['Lb']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Track_set_style_format_1 = (Module['_emscripten_bind_ASS_Track_set_style_format_1'] =
  function () {
    return (_emscripten_bind_ASS_Track_set_style_format_1 = Module['_emscripten_bind_ASS_Track_set_style_format_1'] =
      Module['asm']['Mb']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Track_get_event_format_0 = (Module['_emscripten_bind_ASS_Track_get_event_format_0'] =
  function () {
    return (_emscripten_bind_ASS_Track_get_event_format_0 = Module['_emscripten_bind_ASS_Track_get_event_format_0'] =
      Module['asm']['Nb']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Track_set_event_format_1 = (Module['_emscripten_bind_ASS_Track_set_event_format_1'] =
  function () {
    return (_emscripten_bind_ASS_Track_set_event_format_1 = Module['_emscripten_bind_ASS_Track_set_event_format_1'] =
      Module['asm']['Ob']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Track_get_PlayResX_0 = (Module['_emscripten_bind_ASS_Track_get_PlayResX_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_PlayResX_0 = Module['_emscripten_bind_ASS_Track_get_PlayResX_0'] =
    Module['asm']['Pb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_PlayResX_1 = (Module['_emscripten_bind_ASS_Track_set_PlayResX_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_PlayResX_1 = Module['_emscripten_bind_ASS_Track_set_PlayResX_1'] =
    Module['asm']['Qb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_PlayResY_0 = (Module['_emscripten_bind_ASS_Track_get_PlayResY_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_PlayResY_0 = Module['_emscripten_bind_ASS_Track_get_PlayResY_0'] =
    Module['asm']['Rb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_PlayResY_1 = (Module['_emscripten_bind_ASS_Track_set_PlayResY_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_PlayResY_1 = Module['_emscripten_bind_ASS_Track_set_PlayResY_1'] =
    Module['asm']['Sb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_Timer_0 = (Module['_emscripten_bind_ASS_Track_get_Timer_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_Timer_0 = Module['_emscripten_bind_ASS_Track_get_Timer_0'] =
    Module['asm']['Tb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_Timer_1 = (Module['_emscripten_bind_ASS_Track_set_Timer_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_Timer_1 = Module['_emscripten_bind_ASS_Track_set_Timer_1'] =
    Module['asm']['Ub']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_WrapStyle_0 = (Module['_emscripten_bind_ASS_Track_get_WrapStyle_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_WrapStyle_0 = Module['_emscripten_bind_ASS_Track_get_WrapStyle_0'] =
    Module['asm']['Vb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_WrapStyle_1 = (Module['_emscripten_bind_ASS_Track_set_WrapStyle_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_WrapStyle_1 = Module['_emscripten_bind_ASS_Track_set_WrapStyle_1'] =
    Module['asm']['Wb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0 = (Module[
  '_emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0'
] = function () {
  return (_emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0 = Module[
    '_emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0'
  ] =
    Module['asm']['Xb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1 = (Module[
  '_emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1'
] = function () {
  return (_emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1 = Module[
    '_emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1'
  ] =
    Module['asm']['Yb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_Kerning_0 = (Module['_emscripten_bind_ASS_Track_get_Kerning_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_Kerning_0 = Module['_emscripten_bind_ASS_Track_get_Kerning_0'] =
    Module['asm']['Zb']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_Kerning_1 = (Module['_emscripten_bind_ASS_Track_set_Kerning_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_Kerning_1 = Module['_emscripten_bind_ASS_Track_set_Kerning_1'] =
    Module['asm']['_b']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_Language_0 = (Module['_emscripten_bind_ASS_Track_get_Language_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_Language_0 = Module['_emscripten_bind_ASS_Track_get_Language_0'] =
    Module['asm']['$b']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_Language_1 = (Module['_emscripten_bind_ASS_Track_set_Language_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_Language_1 = Module['_emscripten_bind_ASS_Track_set_Language_1'] =
    Module['asm']['ac']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_get_default_style_0 = (Module['_emscripten_bind_ASS_Track_get_default_style_0'] =
  function () {
    return (_emscripten_bind_ASS_Track_get_default_style_0 = Module['_emscripten_bind_ASS_Track_get_default_style_0'] =
      Module['asm']['bc']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Track_set_default_style_1 = (Module['_emscripten_bind_ASS_Track_set_default_style_1'] =
  function () {
    return (_emscripten_bind_ASS_Track_set_default_style_1 = Module['_emscripten_bind_ASS_Track_set_default_style_1'] =
      Module['asm']['cc']).apply(null, arguments);
  });
var _emscripten_bind_ASS_Track_get_name_0 = (Module['_emscripten_bind_ASS_Track_get_name_0'] = function () {
  return (_emscripten_bind_ASS_Track_get_name_0 = Module['_emscripten_bind_ASS_Track_get_name_0'] =
    Module['asm']['dc']).apply(null, arguments);
});
var _emscripten_bind_ASS_Track_set_name_1 = (Module['_emscripten_bind_ASS_Track_set_name_1'] = function () {
  return (_emscripten_bind_ASS_Track_set_name_1 = Module['_emscripten_bind_ASS_Track_set_name_1'] =
    Module['asm']['ec']).apply(null, arguments);
});
var _emscripten_bind_libass_libass_0 = (Module['_emscripten_bind_libass_libass_0'] = function () {
  return (_emscripten_bind_libass_libass_0 = Module['_emscripten_bind_libass_libass_0'] = Module['asm']['fc']).apply(
    null,
    arguments
  );
});
var _emscripten_bind_libass_oct_library_version_0 = (Module['_emscripten_bind_libass_oct_library_version_0'] =
  function () {
    return (_emscripten_bind_libass_oct_library_version_0 = Module['_emscripten_bind_libass_oct_library_version_0'] =
      Module['asm']['gc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_library_init_0 = (Module['_emscripten_bind_libass_oct_library_init_0'] = function () {
  return (_emscripten_bind_libass_oct_library_init_0 = Module['_emscripten_bind_libass_oct_library_init_0'] =
    Module['asm']['hc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_library_done_1 = (Module['_emscripten_bind_libass_oct_library_done_1'] = function () {
  return (_emscripten_bind_libass_oct_library_done_1 = Module['_emscripten_bind_libass_oct_library_done_1'] =
    Module['asm']['ic']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_fonts_dir_2 = (Module['_emscripten_bind_libass_oct_set_fonts_dir_2'] = function () {
  return (_emscripten_bind_libass_oct_set_fonts_dir_2 = Module['_emscripten_bind_libass_oct_set_fonts_dir_2'] =
    Module['asm']['jc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_extract_fonts_2 = (Module['_emscripten_bind_libass_oct_set_extract_fonts_2'] =
  function () {
    return (_emscripten_bind_libass_oct_set_extract_fonts_2 = Module[
      '_emscripten_bind_libass_oct_set_extract_fonts_2'
    ] =
      Module['asm']['kc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_style_overrides_2 = (Module['_emscripten_bind_libass_oct_set_style_overrides_2'] =
  function () {
    return (_emscripten_bind_libass_oct_set_style_overrides_2 = Module[
      '_emscripten_bind_libass_oct_set_style_overrides_2'
    ] =
      Module['asm']['lc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_process_force_style_1 = (Module['_emscripten_bind_libass_oct_process_force_style_1'] =
  function () {
    return (_emscripten_bind_libass_oct_process_force_style_1 = Module[
      '_emscripten_bind_libass_oct_process_force_style_1'
    ] =
      Module['asm']['mc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_renderer_init_1 = (Module['_emscripten_bind_libass_oct_renderer_init_1'] = function () {
  return (_emscripten_bind_libass_oct_renderer_init_1 = Module['_emscripten_bind_libass_oct_renderer_init_1'] =
    Module['asm']['nc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_renderer_done_1 = (Module['_emscripten_bind_libass_oct_renderer_done_1'] = function () {
  return (_emscripten_bind_libass_oct_renderer_done_1 = Module['_emscripten_bind_libass_oct_renderer_done_1'] =
    Module['asm']['oc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_frame_size_3 = (Module['_emscripten_bind_libass_oct_set_frame_size_3'] =
  function () {
    return (_emscripten_bind_libass_oct_set_frame_size_3 = Module['_emscripten_bind_libass_oct_set_frame_size_3'] =
      Module['asm']['pc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_storage_size_3 = (Module['_emscripten_bind_libass_oct_set_storage_size_3'] =
  function () {
    return (_emscripten_bind_libass_oct_set_storage_size_3 = Module['_emscripten_bind_libass_oct_set_storage_size_3'] =
      Module['asm']['qc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_shaper_2 = (Module['_emscripten_bind_libass_oct_set_shaper_2'] = function () {
  return (_emscripten_bind_libass_oct_set_shaper_2 = Module['_emscripten_bind_libass_oct_set_shaper_2'] =
    Module['asm']['rc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_margins_5 = (Module['_emscripten_bind_libass_oct_set_margins_5'] = function () {
  return (_emscripten_bind_libass_oct_set_margins_5 = Module['_emscripten_bind_libass_oct_set_margins_5'] =
    Module['asm']['sc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_use_margins_2 = (Module['_emscripten_bind_libass_oct_set_use_margins_2'] =
  function () {
    return (_emscripten_bind_libass_oct_set_use_margins_2 = Module['_emscripten_bind_libass_oct_set_use_margins_2'] =
      Module['asm']['tc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_pixel_aspect_2 = (Module['_emscripten_bind_libass_oct_set_pixel_aspect_2'] =
  function () {
    return (_emscripten_bind_libass_oct_set_pixel_aspect_2 = Module['_emscripten_bind_libass_oct_set_pixel_aspect_2'] =
      Module['asm']['uc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_aspect_ratio_3 = (Module['_emscripten_bind_libass_oct_set_aspect_ratio_3'] =
  function () {
    return (_emscripten_bind_libass_oct_set_aspect_ratio_3 = Module['_emscripten_bind_libass_oct_set_aspect_ratio_3'] =
      Module['asm']['vc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_font_scale_2 = (Module['_emscripten_bind_libass_oct_set_font_scale_2'] =
  function () {
    return (_emscripten_bind_libass_oct_set_font_scale_2 = Module['_emscripten_bind_libass_oct_set_font_scale_2'] =
      Module['asm']['wc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_hinting_2 = (Module['_emscripten_bind_libass_oct_set_hinting_2'] = function () {
  return (_emscripten_bind_libass_oct_set_hinting_2 = Module['_emscripten_bind_libass_oct_set_hinting_2'] =
    Module['asm']['xc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_line_spacing_2 = (Module['_emscripten_bind_libass_oct_set_line_spacing_2'] =
  function () {
    return (_emscripten_bind_libass_oct_set_line_spacing_2 = Module['_emscripten_bind_libass_oct_set_line_spacing_2'] =
      Module['asm']['yc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_line_position_2 = (Module['_emscripten_bind_libass_oct_set_line_position_2'] =
  function () {
    return (_emscripten_bind_libass_oct_set_line_position_2 = Module[
      '_emscripten_bind_libass_oct_set_line_position_2'
    ] =
      Module['asm']['zc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_set_fonts_6 = (Module['_emscripten_bind_libass_oct_set_fonts_6'] = function () {
  return (_emscripten_bind_libass_oct_set_fonts_6 = Module['_emscripten_bind_libass_oct_set_fonts_6'] =
    Module['asm']['Ac']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_selective_style_override_enabled_2 = (Module[
  '_emscripten_bind_libass_oct_set_selective_style_override_enabled_2'
] = function () {
  return (_emscripten_bind_libass_oct_set_selective_style_override_enabled_2 = Module[
    '_emscripten_bind_libass_oct_set_selective_style_override_enabled_2'
  ] =
    Module['asm']['Bc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_selective_style_override_2 = (Module[
  '_emscripten_bind_libass_oct_set_selective_style_override_2'
] = function () {
  return (_emscripten_bind_libass_oct_set_selective_style_override_2 = Module[
    '_emscripten_bind_libass_oct_set_selective_style_override_2'
  ] =
    Module['asm']['Cc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_set_cache_limits_3 = (Module['_emscripten_bind_libass_oct_set_cache_limits_3'] =
  function () {
    return (_emscripten_bind_libass_oct_set_cache_limits_3 = Module['_emscripten_bind_libass_oct_set_cache_limits_3'] =
      Module['asm']['Dc']).apply(null, arguments);
  });
var _emscripten_bind_libass_oct_render_frame_4 = (Module['_emscripten_bind_libass_oct_render_frame_4'] = function () {
  return (_emscripten_bind_libass_oct_render_frame_4 = Module['_emscripten_bind_libass_oct_render_frame_4'] =
    Module['asm']['Ec']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_new_track_1 = (Module['_emscripten_bind_libass_oct_new_track_1'] = function () {
  return (_emscripten_bind_libass_oct_new_track_1 = Module['_emscripten_bind_libass_oct_new_track_1'] =
    Module['asm']['Fc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_free_track_1 = (Module['_emscripten_bind_libass_oct_free_track_1'] = function () {
  return (_emscripten_bind_libass_oct_free_track_1 = Module['_emscripten_bind_libass_oct_free_track_1'] =
    Module['asm']['Gc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_alloc_style_1 = (Module['_emscripten_bind_libass_oct_alloc_style_1'] = function () {
  return (_emscripten_bind_libass_oct_alloc_style_1 = Module['_emscripten_bind_libass_oct_alloc_style_1'] =
    Module['asm']['Hc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_alloc_event_1 = (Module['_emscripten_bind_libass_oct_alloc_event_1'] = function () {
  return (_emscripten_bind_libass_oct_alloc_event_1 = Module['_emscripten_bind_libass_oct_alloc_event_1'] =
    Module['asm']['Ic']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_free_style_2 = (Module['_emscripten_bind_libass_oct_free_style_2'] = function () {
  return (_emscripten_bind_libass_oct_free_style_2 = Module['_emscripten_bind_libass_oct_free_style_2'] =
    Module['asm']['Jc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_free_event_2 = (Module['_emscripten_bind_libass_oct_free_event_2'] = function () {
  return (_emscripten_bind_libass_oct_free_event_2 = Module['_emscripten_bind_libass_oct_free_event_2'] =
    Module['asm']['Kc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_flush_events_1 = (Module['_emscripten_bind_libass_oct_flush_events_1'] = function () {
  return (_emscripten_bind_libass_oct_flush_events_1 = Module['_emscripten_bind_libass_oct_flush_events_1'] =
    Module['asm']['Lc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_read_file_3 = (Module['_emscripten_bind_libass_oct_read_file_3'] = function () {
  return (_emscripten_bind_libass_oct_read_file_3 = Module['_emscripten_bind_libass_oct_read_file_3'] =
    Module['asm']['Mc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_add_font_4 = (Module['_emscripten_bind_libass_oct_add_font_4'] = function () {
  return (_emscripten_bind_libass_oct_add_font_4 = Module['_emscripten_bind_libass_oct_add_font_4'] =
    Module['asm']['Nc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_clear_fonts_1 = (Module['_emscripten_bind_libass_oct_clear_fonts_1'] = function () {
  return (_emscripten_bind_libass_oct_clear_fonts_1 = Module['_emscripten_bind_libass_oct_clear_fonts_1'] =
    Module['asm']['Oc']).apply(null, arguments);
});
var _emscripten_bind_libass_oct_step_sub_3 = (Module['_emscripten_bind_libass_oct_step_sub_3'] = function () {
  return (_emscripten_bind_libass_oct_step_sub_3 = Module['_emscripten_bind_libass_oct_step_sub_3'] =
    Module['asm']['Pc']).apply(null, arguments);
});
var _emscripten_bind_RenderBlendResult_get_changed_0 = (Module['_emscripten_bind_RenderBlendResult_get_changed_0'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_get_changed_0 = Module[
      '_emscripten_bind_RenderBlendResult_get_changed_0'
    ] =
      Module['asm']['Qc']).apply(null, arguments);
  });
var _emscripten_bind_RenderBlendResult_set_changed_1 = (Module['_emscripten_bind_RenderBlendResult_set_changed_1'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_set_changed_1 = Module[
      '_emscripten_bind_RenderBlendResult_set_changed_1'
    ] =
      Module['asm']['Rc']).apply(null, arguments);
  });
var _emscripten_bind_RenderBlendResult_get_blend_time_0 = (Module[
  '_emscripten_bind_RenderBlendResult_get_blend_time_0'
] = function () {
  return (_emscripten_bind_RenderBlendResult_get_blend_time_0 = Module[
    '_emscripten_bind_RenderBlendResult_get_blend_time_0'
  ] =
    Module['asm']['Sc']).apply(null, arguments);
});
var _emscripten_bind_RenderBlendResult_set_blend_time_1 = (Module[
  '_emscripten_bind_RenderBlendResult_set_blend_time_1'
] = function () {
  return (_emscripten_bind_RenderBlendResult_set_blend_time_1 = Module[
    '_emscripten_bind_RenderBlendResult_set_blend_time_1'
  ] =
    Module['asm']['Tc']).apply(null, arguments);
});
var _emscripten_bind_RenderBlendResult_get_dest_x_0 = (Module['_emscripten_bind_RenderBlendResult_get_dest_x_0'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_get_dest_x_0 = Module[
      '_emscripten_bind_RenderBlendResult_get_dest_x_0'
    ] =
      Module['asm']['Uc']).apply(null, arguments);
  });
var _emscripten_bind_RenderBlendResult_set_dest_x_1 = (Module['_emscripten_bind_RenderBlendResult_set_dest_x_1'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_set_dest_x_1 = Module[
      '_emscripten_bind_RenderBlendResult_set_dest_x_1'
    ] =
      Module['asm']['Vc']).apply(null, arguments);
  });
var _emscripten_bind_RenderBlendResult_get_dest_y_0 = (Module['_emscripten_bind_RenderBlendResult_get_dest_y_0'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_get_dest_y_0 = Module[
      '_emscripten_bind_RenderBlendResult_get_dest_y_0'
    ] =
      Module['asm']['Wc']).apply(null, arguments);
  });
var _emscripten_bind_RenderBlendResult_set_dest_y_1 = (Module['_emscripten_bind_RenderBlendResult_set_dest_y_1'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_set_dest_y_1 = Module[
      '_emscripten_bind_RenderBlendResult_set_dest_y_1'
    ] =
      Module['asm']['Xc']).apply(null, arguments);
  });
var _emscripten_bind_RenderBlendResult_get_dest_width_0 = (Module[
  '_emscripten_bind_RenderBlendResult_get_dest_width_0'
] = function () {
  return (_emscripten_bind_RenderBlendResult_get_dest_width_0 = Module[
    '_emscripten_bind_RenderBlendResult_get_dest_width_0'
  ] =
    Module['asm']['Yc']).apply(null, arguments);
});
var _emscripten_bind_RenderBlendResult_set_dest_width_1 = (Module[
  '_emscripten_bind_RenderBlendResult_set_dest_width_1'
] = function () {
  return (_emscripten_bind_RenderBlendResult_set_dest_width_1 = Module[
    '_emscripten_bind_RenderBlendResult_set_dest_width_1'
  ] =
    Module['asm']['Zc']).apply(null, arguments);
});
var _emscripten_bind_RenderBlendResult_get_dest_height_0 = (Module[
  '_emscripten_bind_RenderBlendResult_get_dest_height_0'
] = function () {
  return (_emscripten_bind_RenderBlendResult_get_dest_height_0 = Module[
    '_emscripten_bind_RenderBlendResult_get_dest_height_0'
  ] =
    Module['asm']['_c']).apply(null, arguments);
});
var _emscripten_bind_RenderBlendResult_set_dest_height_1 = (Module[
  '_emscripten_bind_RenderBlendResult_set_dest_height_1'
] = function () {
  return (_emscripten_bind_RenderBlendResult_set_dest_height_1 = Module[
    '_emscripten_bind_RenderBlendResult_set_dest_height_1'
  ] =
    Module['asm']['$c']).apply(null, arguments);
});
var _emscripten_bind_RenderBlendResult_get_image_0 = (Module['_emscripten_bind_RenderBlendResult_get_image_0'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_get_image_0 = Module['_emscripten_bind_RenderBlendResult_get_image_0'] =
      Module['asm']['ad']).apply(null, arguments);
  });
var _emscripten_bind_RenderBlendResult_set_image_1 = (Module['_emscripten_bind_RenderBlendResult_set_image_1'] =
  function () {
    return (_emscripten_bind_RenderBlendResult_set_image_1 = Module['_emscripten_bind_RenderBlendResult_set_image_1'] =
      Module['asm']['bd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_SubtitleOctopus_0 = (Module['_emscripten_bind_SubtitleOctopus_SubtitleOctopus_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_SubtitleOctopus_0 = Module[
      '_emscripten_bind_SubtitleOctopus_SubtitleOctopus_0'
    ] =
      Module['asm']['cd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_setLogLevel_1 = (Module['_emscripten_bind_SubtitleOctopus_setLogLevel_1'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_setLogLevel_1 = Module['_emscripten_bind_SubtitleOctopus_setLogLevel_1'] =
      Module['asm']['dd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_setDropAnimations_1 = (Module[
  '_emscripten_bind_SubtitleOctopus_setDropAnimations_1'
] = function () {
  return (_emscripten_bind_SubtitleOctopus_setDropAnimations_1 = Module[
    '_emscripten_bind_SubtitleOctopus_setDropAnimations_1'
  ] =
    Module['asm']['ed']).apply(null, arguments);
});
var _emscripten_bind_SubtitleOctopus_initLibrary_3 = (Module['_emscripten_bind_SubtitleOctopus_initLibrary_3'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_initLibrary_3 = Module['_emscripten_bind_SubtitleOctopus_initLibrary_3'] =
      Module['asm']['fd']).apply(null, arguments);
  });
var _free = (Module['_free'] = function () {
  return (_free = Module['_free'] = Module['asm']['gd']).apply(null, arguments);
});
var _emscripten_bind_SubtitleOctopus_createTrack_1 = (Module['_emscripten_bind_SubtitleOctopus_createTrack_1'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_createTrack_1 = Module['_emscripten_bind_SubtitleOctopus_createTrack_1'] =
      Module['asm']['hd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_createTrackMem_2 = (Module['_emscripten_bind_SubtitleOctopus_createTrackMem_2'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_createTrackMem_2 = Module[
      '_emscripten_bind_SubtitleOctopus_createTrackMem_2'
    ] =
      Module['asm']['id']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_removeTrack_0 = (Module['_emscripten_bind_SubtitleOctopus_removeTrack_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_removeTrack_0 = Module['_emscripten_bind_SubtitleOctopus_removeTrack_0'] =
      Module['asm']['jd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_resizeCanvas_2 = (Module['_emscripten_bind_SubtitleOctopus_resizeCanvas_2'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_resizeCanvas_2 = Module[
      '_emscripten_bind_SubtitleOctopus_resizeCanvas_2'
    ] =
      Module['asm']['kd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_renderImage_2 = (Module['_emscripten_bind_SubtitleOctopus_renderImage_2'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_renderImage_2 = Module['_emscripten_bind_SubtitleOctopus_renderImage_2'] =
      Module['asm']['ld']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_quitLibrary_0 = (Module['_emscripten_bind_SubtitleOctopus_quitLibrary_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_quitLibrary_0 = Module['_emscripten_bind_SubtitleOctopus_quitLibrary_0'] =
      Module['asm']['md']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_reloadLibrary_0 = (Module['_emscripten_bind_SubtitleOctopus_reloadLibrary_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_reloadLibrary_0 = Module[
      '_emscripten_bind_SubtitleOctopus_reloadLibrary_0'
    ] =
      Module['asm']['nd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_reloadFonts_0 = (Module['_emscripten_bind_SubtitleOctopus_reloadFonts_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_reloadFonts_0 = Module['_emscripten_bind_SubtitleOctopus_reloadFonts_0'] =
      Module['asm']['od']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_setMargin_4 = (Module['_emscripten_bind_SubtitleOctopus_setMargin_4'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_setMargin_4 = Module['_emscripten_bind_SubtitleOctopus_setMargin_4'] =
      Module['asm']['pd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_getEventCount_0 = (Module['_emscripten_bind_SubtitleOctopus_getEventCount_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_getEventCount_0 = Module[
      '_emscripten_bind_SubtitleOctopus_getEventCount_0'
    ] =
      Module['asm']['qd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_allocEvent_0 = (Module['_emscripten_bind_SubtitleOctopus_allocEvent_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_allocEvent_0 = Module['_emscripten_bind_SubtitleOctopus_allocEvent_0'] =
      Module['asm']['rd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_allocStyle_0 = (Module['_emscripten_bind_SubtitleOctopus_allocStyle_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_allocStyle_0 = Module['_emscripten_bind_SubtitleOctopus_allocStyle_0'] =
      Module['asm']['sd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_removeEvent_1 = (Module['_emscripten_bind_SubtitleOctopus_removeEvent_1'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_removeEvent_1 = Module['_emscripten_bind_SubtitleOctopus_removeEvent_1'] =
      Module['asm']['td']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_getStyleCount_0 = (Module['_emscripten_bind_SubtitleOctopus_getStyleCount_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_getStyleCount_0 = Module[
      '_emscripten_bind_SubtitleOctopus_getStyleCount_0'
    ] =
      Module['asm']['ud']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_getStyleByName_1 = (Module['_emscripten_bind_SubtitleOctopus_getStyleByName_1'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_getStyleByName_1 = Module[
      '_emscripten_bind_SubtitleOctopus_getStyleByName_1'
    ] =
      Module['asm']['vd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_removeStyle_1 = (Module['_emscripten_bind_SubtitleOctopus_removeStyle_1'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_removeStyle_1 = Module['_emscripten_bind_SubtitleOctopus_removeStyle_1'] =
      Module['asm']['wd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_removeAllEvents_0 = (Module['_emscripten_bind_SubtitleOctopus_removeAllEvents_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_removeAllEvents_0 = Module[
      '_emscripten_bind_SubtitleOctopus_removeAllEvents_0'
    ] =
      Module['asm']['xd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_setMemoryLimits_2 = (Module['_emscripten_bind_SubtitleOctopus_setMemoryLimits_2'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_setMemoryLimits_2 = Module[
      '_emscripten_bind_SubtitleOctopus_setMemoryLimits_2'
    ] =
      Module['asm']['yd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_renderBlend_2 = (Module['_emscripten_bind_SubtitleOctopus_renderBlend_2'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_renderBlend_2 = Module['_emscripten_bind_SubtitleOctopus_renderBlend_2'] =
      Module['asm']['zd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_get_track_0 = (Module['_emscripten_bind_SubtitleOctopus_get_track_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_get_track_0 = Module['_emscripten_bind_SubtitleOctopus_get_track_0'] =
      Module['asm']['Ad']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_set_track_1 = (Module['_emscripten_bind_SubtitleOctopus_set_track_1'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_set_track_1 = Module['_emscripten_bind_SubtitleOctopus_set_track_1'] =
      Module['asm']['Bd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_get_ass_renderer_0 = (Module[
  '_emscripten_bind_SubtitleOctopus_get_ass_renderer_0'
] = function () {
  return (_emscripten_bind_SubtitleOctopus_get_ass_renderer_0 = Module[
    '_emscripten_bind_SubtitleOctopus_get_ass_renderer_0'
  ] =
    Module['asm']['Cd']).apply(null, arguments);
});
var _emscripten_bind_SubtitleOctopus_set_ass_renderer_1 = (Module[
  '_emscripten_bind_SubtitleOctopus_set_ass_renderer_1'
] = function () {
  return (_emscripten_bind_SubtitleOctopus_set_ass_renderer_1 = Module[
    '_emscripten_bind_SubtitleOctopus_set_ass_renderer_1'
  ] =
    Module['asm']['Dd']).apply(null, arguments);
});
var _emscripten_bind_SubtitleOctopus_get_ass_library_0 = (Module['_emscripten_bind_SubtitleOctopus_get_ass_library_0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_get_ass_library_0 = Module[
      '_emscripten_bind_SubtitleOctopus_get_ass_library_0'
    ] =
      Module['asm']['Ed']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus_set_ass_library_1 = (Module['_emscripten_bind_SubtitleOctopus_set_ass_library_1'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus_set_ass_library_1 = Module[
      '_emscripten_bind_SubtitleOctopus_set_ass_library_1'
    ] =
      Module['asm']['Fd']).apply(null, arguments);
  });
var _emscripten_bind_SubtitleOctopus___destroy___0 = (Module['_emscripten_bind_SubtitleOctopus___destroy___0'] =
  function () {
    return (_emscripten_bind_SubtitleOctopus___destroy___0 = Module['_emscripten_bind_SubtitleOctopus___destroy___0'] =
      Module['asm']['Gd']).apply(null, arguments);
  });
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NONE = (Module['_emscripten_enum_ASS_Hinting_ASS_HINTING_NONE'] =
  function () {
    return (_emscripten_enum_ASS_Hinting_ASS_HINTING_NONE = Module['_emscripten_enum_ASS_Hinting_ASS_HINTING_NONE'] =
      Module['asm']['Hd']).apply(null, arguments);
  });
var _emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT = (Module['_emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT'] =
  function () {
    return (_emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT = Module['_emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT'] =
      Module['asm']['Id']).apply(null, arguments);
  });
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL = (Module['_emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL'] =
  function () {
    return (_emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL = Module[
      '_emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL'
    ] =
      Module['asm']['Jd']).apply(null, arguments);
  });
var _emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE = (Module['_emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE'] =
  function () {
    return (_emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE = Module[
      '_emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE'
    ] =
      Module['asm']['Kd']).apply(null, arguments);
  });
var _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE = (Module[
  '_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE'
] = function () {
  return (_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE = Module[
    '_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE'
  ] =
    Module['asm']['Ld']).apply(null, arguments);
});
var _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX = (Module[
  '_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX'
] = function () {
  return (_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX = Module[
    '_emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX'
  ] =
    Module['asm']['Md']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT'
  ] =
    Module['asm']['Nd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE'
  ] =
    Module['asm']['Od']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE'
  ] =
    Module['asm']['Pd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE'
  ] =
    Module['asm']['Qd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS'
  ] =
    Module['asm']['Rd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME'
  ] =
    Module['asm']['Sd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS'
  ] =
    Module['asm']['Td']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES'
  ] =
    Module['asm']['Ud']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER'
  ] =
    Module['asm']['Vd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT'
  ] =
    Module['asm']['Wd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS'
  ] =
    Module['asm']['Xd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE'
  ] =
    Module['asm']['Yd']).apply(null, arguments);
});
var _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY = (Module[
  '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY'
] = function () {
  return (_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY = Module[
    '_emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY'
  ] =
    Module['asm']['Zd']).apply(null, arguments);
});
var ___errno_location = (Module['___errno_location'] = function () {
  return (___errno_location = Module['___errno_location'] = Module['asm']['$d']).apply(null, arguments);
});
var _malloc = (Module['_malloc'] = function () {
  return (_malloc = Module['_malloc'] = Module['asm']['ae']).apply(null, arguments);
});
var _emscripten_builtin_memalign = (Module['_emscripten_builtin_memalign'] = function () {
  return (_emscripten_builtin_memalign = Module['_emscripten_builtin_memalign'] = Module['asm']['be']).apply(
    null,
    arguments
  );
});
var _setThrew = (Module['_setThrew'] = function () {
  return (_setThrew = Module['_setThrew'] = Module['asm']['ce']).apply(null, arguments);
});
var stackSave = (Module['stackSave'] = function () {
  return (stackSave = Module['stackSave'] = Module['asm']['de']).apply(null, arguments);
});
var stackRestore = (Module['stackRestore'] = function () {
  return (stackRestore = Module['stackRestore'] = Module['asm']['ee']).apply(null, arguments);
});
var stackAlloc = (Module['stackAlloc'] = function () {
  return (stackAlloc = Module['stackAlloc'] = Module['asm']['fe']).apply(null, arguments);
});
var ___emscripten_embedded_file_data = (Module['___emscripten_embedded_file_data'] = 28920);
function invoke_iii(index, a1, a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}
function invoke_iiii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}
Module['ccall'] = ccall;
Module['cwrap'] = cwrap;
Module['addRunDependency'] = addRunDependency;
Module['removeRunDependency'] = removeRunDependency;
Module['FS_createPath'] = FS.createPath;
Module['FS_createDataFile'] = FS.createDataFile;
Module['FS_createPreloadedFile'] = FS.createPreloadedFile;
Module['FS_createLazyFile'] = FS.createLazyFile;
Module['FS_createDevice'] = FS.createDevice;
Module['FS_unlink'] = FS.unlink;
Module['getValue'] = getValue;
var calledRun;
function ExitStatus(status) {
  this.name = 'ExitStatus';
  this.message = 'Program terminated with exit(' + status + ')';
  this.status = status;
}
var calledMain = false;
dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
};
function callMain(args) {
  var entryFunction = Module['_main'];
  args = args || [];
  args.unshift(thisProgram);
  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv >> 2;
  args.forEach((arg) => {
    HEAP32[argv_ptr++] = allocateUTF8OnStack(arg);
  });
  HEAP32[argv_ptr] = 0;
  try {
    var ret = entryFunction(argc, argv);
    exit(ret, true);
    return ret;
  } catch (e) {
    return handleException(e);
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || arguments_;
  if (runDependencies > 0) {
    return;
  }
  preRun();
  if (runDependencies > 0) {
    return;
  }
  function doRun() {
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;
    if (ABORT) return;
    initRuntime();
    preMain();
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();
    if (shouldRunNow) callMain(args);
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function () {
      setTimeout(function () {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = run;
function exit(status, implicit) {
  EXITSTATUS = status;
  procExit(status);
}
function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    if (Module['onExit']) Module['onExit'](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
var shouldRunNow = true;
if (Module['noInitialRun']) shouldRunNow = false;
run();
function WrapperObject() {}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;
function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;
function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return (cache[ptr] = ret);
}
Module['wrapPointer'] = wrapPointer;
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;
Module['NULL'] = wrapPointer(0);
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;
var ensureCache = {
  buffer: 0,
  size: 0,
  pos: 0,
  temps: [],
  owned: [],
  needed: 0,
  prepare: function () {
    if (ensureCache.needed) {
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module['_free'](ensureCache.temps[i]);
      }
      ensureCache.temps.length = 0;
      Module['_free'](ensureCache.buffer);
      ensureCache.buffer = 0;
      ensureCache.size += ensureCache.needed;
      ensureCache.needed = 0;
    }
    if (!ensureCache.buffer) {
      ensureCache.size += 128;
      ensureCache.buffer = Module['_malloc'](ensureCache.size);
      assert(ensureCache.buffer);
    }
    ensureCache.pos = 0;
  },
  alloc: function (array, view, owner) {
    assert(ensureCache.buffer);
    var bytes = view.BYTES_PER_ELEMENT;
    var len = array.length * bytes;
    len = (len + 7) & -8;
    var ret;
    if (owner) {
      assert(len > 0);
      ensureCache.needed += len;
      ret = Module['_malloc'](len);
      ensureCache.owned.push(ret);
    } else {
      if (ensureCache.pos + len >= ensureCache.size) {
        assert(len > 0);
        ensureCache.needed += len;
        ret = Module['_malloc'](len);
        ensureCache.temps.push(ret);
      } else {
        ret = ensureCache.buffer + ensureCache.pos;
        ensureCache.pos += len;
      }
    }
    return ret;
  },
  copy: function (array, view, offset) {
    offset >>>= 0;
    var bytes = view.BYTES_PER_ELEMENT;
    switch (bytes) {
      case 2:
        offset >>>= 1;
        break;
      case 4:
        offset >>>= 2;
        break;
      case 8:
        offset >>>= 3;
        break;
    }
    for (var i = 0; i < array.length; i++) {
      view[offset + i] = array[i];
    }
  },
  clear: function (clearOwned) {
    for (var i = 0; i < ensureCache.temps.length; i++) {
      Module['_free'](ensureCache.temps[i]);
    }
    if (clearOwned) {
      for (var i = 0; i < ensureCache.owned.length; i++) {
        Module['_free'](ensureCache.owned[i]);
      }
    }
    ensureCache.temps.length = 0;
    Module['_free'](ensureCache.buffer);
    ensureCache.buffer = 0;
    ensureCache.size = 0;
    ensureCache.needed = 0;
  },
};
function ensureString(value, owner) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value);
    var offset = ensureCache.alloc(intArray, HEAP8, owner);
    ensureCache.copy(intArray, HEAP8, offset);
    return offset;
  }
  return value;
}
function VoidPtr() {
  throw 'cannot construct a VoidPtr, no constructor in IDL';
}
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;
VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = function () {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
function ASS_Image() {
  throw 'cannot construct a ASS_Image, no constructor in IDL';
}
ASS_Image.prototype = Object.create(WrapperObject.prototype);
ASS_Image.prototype.constructor = ASS_Image;
ASS_Image.prototype.__class__ = ASS_Image;
ASS_Image.__cache__ = {};
Module['ASS_Image'] = ASS_Image;
ASS_Image.prototype['get_w'] = ASS_Image.prototype.get_w = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_w_0(self);
};
ASS_Image.prototype['set_w'] = ASS_Image.prototype.set_w = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_w_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'w', { get: ASS_Image.prototype.get_w, set: ASS_Image.prototype.set_w });
ASS_Image.prototype['get_h'] = ASS_Image.prototype.get_h = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_h_0(self);
};
ASS_Image.prototype['set_h'] = ASS_Image.prototype.set_h = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_h_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'h', { get: ASS_Image.prototype.get_h, set: ASS_Image.prototype.set_h });
ASS_Image.prototype['get_stride'] = ASS_Image.prototype.get_stride = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_stride_0(self);
};
ASS_Image.prototype['set_stride'] = ASS_Image.prototype.set_stride = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_stride_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'stride', {
  get: ASS_Image.prototype.get_stride,
  set: ASS_Image.prototype.set_stride,
});
ASS_Image.prototype['get_bitmap'] = ASS_Image.prototype.get_bitmap = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_bitmap_0(self);
};
ASS_Image.prototype['set_bitmap'] = ASS_Image.prototype.set_bitmap = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, false);
  _emscripten_bind_ASS_Image_set_bitmap_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'bitmap', {
  get: ASS_Image.prototype.get_bitmap,
  set: ASS_Image.prototype.set_bitmap,
});
ASS_Image.prototype['get_color'] = ASS_Image.prototype.get_color = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_color_0(self);
};
ASS_Image.prototype['set_color'] = ASS_Image.prototype.set_color = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_color_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'color', {
  get: ASS_Image.prototype.get_color,
  set: ASS_Image.prototype.set_color,
});
ASS_Image.prototype['get_dst_x'] = ASS_Image.prototype.get_dst_x = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_dst_x_0(self);
};
ASS_Image.prototype['set_dst_x'] = ASS_Image.prototype.set_dst_x = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_dst_x_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'dst_x', {
  get: ASS_Image.prototype.get_dst_x,
  set: ASS_Image.prototype.set_dst_x,
});
ASS_Image.prototype['get_dst_y'] = ASS_Image.prototype.get_dst_y = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Image_get_dst_y_0(self);
};
ASS_Image.prototype['set_dst_y'] = ASS_Image.prototype.set_dst_y = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_dst_y_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'dst_y', {
  get: ASS_Image.prototype.get_dst_y,
  set: ASS_Image.prototype.set_dst_y,
});
ASS_Image.prototype['get_next'] = ASS_Image.prototype.get_next = function () {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_ASS_Image_get_next_0(self), ASS_Image);
};
ASS_Image.prototype['set_next'] = ASS_Image.prototype.set_next = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Image_set_next_1(self, arg0);
};
Object.defineProperty(ASS_Image.prototype, 'next', {
  get: ASS_Image.prototype.get_next,
  set: ASS_Image.prototype.set_next,
});
function ASS_Style() {
  throw 'cannot construct a ASS_Style, no constructor in IDL';
}
ASS_Style.prototype = Object.create(WrapperObject.prototype);
ASS_Style.prototype.constructor = ASS_Style;
ASS_Style.prototype.__class__ = ASS_Style;
ASS_Style.__cache__ = {};
Module['ASS_Style'] = ASS_Style;
ASS_Style.prototype['get_Name'] = ASS_Style.prototype.get_Name = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Style_get_Name_0(self));
};
ASS_Style.prototype['set_Name'] = ASS_Style.prototype.set_Name = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Style_set_Name_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Name', {
  get: ASS_Style.prototype.get_Name,
  set: ASS_Style.prototype.set_Name,
});
ASS_Style.prototype['get_FontName'] = ASS_Style.prototype.get_FontName = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Style_get_FontName_0(self));
};
ASS_Style.prototype['set_FontName'] = ASS_Style.prototype.set_FontName = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Style_set_FontName_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'FontName', {
  get: ASS_Style.prototype.get_FontName,
  set: ASS_Style.prototype.set_FontName,
});
ASS_Style.prototype['get_FontSize'] = ASS_Style.prototype.get_FontSize = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_FontSize_0(self);
};
ASS_Style.prototype['set_FontSize'] = ASS_Style.prototype.set_FontSize = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_FontSize_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'FontSize', {
  get: ASS_Style.prototype.get_FontSize,
  set: ASS_Style.prototype.set_FontSize,
});
ASS_Style.prototype['get_PrimaryColour'] = ASS_Style.prototype.get_PrimaryColour = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_PrimaryColour_0(self);
};
ASS_Style.prototype['set_PrimaryColour'] = ASS_Style.prototype.set_PrimaryColour = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_PrimaryColour_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'PrimaryColour', {
  get: ASS_Style.prototype.get_PrimaryColour,
  set: ASS_Style.prototype.set_PrimaryColour,
});
ASS_Style.prototype['get_SecondaryColour'] = ASS_Style.prototype.get_SecondaryColour = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_SecondaryColour_0(self);
};
ASS_Style.prototype['set_SecondaryColour'] = ASS_Style.prototype.set_SecondaryColour = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_SecondaryColour_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'SecondaryColour', {
  get: ASS_Style.prototype.get_SecondaryColour,
  set: ASS_Style.prototype.set_SecondaryColour,
});
ASS_Style.prototype['get_OutlineColour'] = ASS_Style.prototype.get_OutlineColour = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_OutlineColour_0(self);
};
ASS_Style.prototype['set_OutlineColour'] = ASS_Style.prototype.set_OutlineColour = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_OutlineColour_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'OutlineColour', {
  get: ASS_Style.prototype.get_OutlineColour,
  set: ASS_Style.prototype.set_OutlineColour,
});
ASS_Style.prototype['get_BackColour'] = ASS_Style.prototype.get_BackColour = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_BackColour_0(self);
};
ASS_Style.prototype['set_BackColour'] = ASS_Style.prototype.set_BackColour = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_BackColour_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'BackColour', {
  get: ASS_Style.prototype.get_BackColour,
  set: ASS_Style.prototype.set_BackColour,
});
ASS_Style.prototype['get_Bold'] = ASS_Style.prototype.get_Bold = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Bold_0(self);
};
ASS_Style.prototype['set_Bold'] = ASS_Style.prototype.set_Bold = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Bold_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Bold', {
  get: ASS_Style.prototype.get_Bold,
  set: ASS_Style.prototype.set_Bold,
});
ASS_Style.prototype['get_Italic'] = ASS_Style.prototype.get_Italic = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Italic_0(self);
};
ASS_Style.prototype['set_Italic'] = ASS_Style.prototype.set_Italic = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Italic_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Italic', {
  get: ASS_Style.prototype.get_Italic,
  set: ASS_Style.prototype.set_Italic,
});
ASS_Style.prototype['get_Underline'] = ASS_Style.prototype.get_Underline = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Underline_0(self);
};
ASS_Style.prototype['set_Underline'] = ASS_Style.prototype.set_Underline = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Underline_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Underline', {
  get: ASS_Style.prototype.get_Underline,
  set: ASS_Style.prototype.set_Underline,
});
ASS_Style.prototype['get_StrikeOut'] = ASS_Style.prototype.get_StrikeOut = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_StrikeOut_0(self);
};
ASS_Style.prototype['set_StrikeOut'] = ASS_Style.prototype.set_StrikeOut = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_StrikeOut_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'StrikeOut', {
  get: ASS_Style.prototype.get_StrikeOut,
  set: ASS_Style.prototype.set_StrikeOut,
});
ASS_Style.prototype['get_ScaleX'] = ASS_Style.prototype.get_ScaleX = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_ScaleX_0(self);
};
ASS_Style.prototype['set_ScaleX'] = ASS_Style.prototype.set_ScaleX = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_ScaleX_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'ScaleX', {
  get: ASS_Style.prototype.get_ScaleX,
  set: ASS_Style.prototype.set_ScaleX,
});
ASS_Style.prototype['get_ScaleY'] = ASS_Style.prototype.get_ScaleY = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_ScaleY_0(self);
};
ASS_Style.prototype['set_ScaleY'] = ASS_Style.prototype.set_ScaleY = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_ScaleY_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'ScaleY', {
  get: ASS_Style.prototype.get_ScaleY,
  set: ASS_Style.prototype.set_ScaleY,
});
ASS_Style.prototype['get_Spacing'] = ASS_Style.prototype.get_Spacing = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Spacing_0(self);
};
ASS_Style.prototype['set_Spacing'] = ASS_Style.prototype.set_Spacing = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Spacing_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Spacing', {
  get: ASS_Style.prototype.get_Spacing,
  set: ASS_Style.prototype.set_Spacing,
});
ASS_Style.prototype['get_Angle'] = ASS_Style.prototype.get_Angle = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Angle_0(self);
};
ASS_Style.prototype['set_Angle'] = ASS_Style.prototype.set_Angle = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Angle_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Angle', {
  get: ASS_Style.prototype.get_Angle,
  set: ASS_Style.prototype.set_Angle,
});
ASS_Style.prototype['get_BorderStyle'] = ASS_Style.prototype.get_BorderStyle = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_BorderStyle_0(self);
};
ASS_Style.prototype['set_BorderStyle'] = ASS_Style.prototype.set_BorderStyle = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_BorderStyle_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'BorderStyle', {
  get: ASS_Style.prototype.get_BorderStyle,
  set: ASS_Style.prototype.set_BorderStyle,
});
ASS_Style.prototype['get_Outline'] = ASS_Style.prototype.get_Outline = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Outline_0(self);
};
ASS_Style.prototype['set_Outline'] = ASS_Style.prototype.set_Outline = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Outline_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Outline', {
  get: ASS_Style.prototype.get_Outline,
  set: ASS_Style.prototype.set_Outline,
});
ASS_Style.prototype['get_Shadow'] = ASS_Style.prototype.get_Shadow = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Shadow_0(self);
};
ASS_Style.prototype['set_Shadow'] = ASS_Style.prototype.set_Shadow = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Shadow_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Shadow', {
  get: ASS_Style.prototype.get_Shadow,
  set: ASS_Style.prototype.set_Shadow,
});
ASS_Style.prototype['get_Alignment'] = ASS_Style.prototype.get_Alignment = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Alignment_0(self);
};
ASS_Style.prototype['set_Alignment'] = ASS_Style.prototype.set_Alignment = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Alignment_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Alignment', {
  get: ASS_Style.prototype.get_Alignment,
  set: ASS_Style.prototype.set_Alignment,
});
ASS_Style.prototype['get_MarginL'] = ASS_Style.prototype.get_MarginL = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_MarginL_0(self);
};
ASS_Style.prototype['set_MarginL'] = ASS_Style.prototype.set_MarginL = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_MarginL_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'MarginL', {
  get: ASS_Style.prototype.get_MarginL,
  set: ASS_Style.prototype.set_MarginL,
});
ASS_Style.prototype['get_MarginR'] = ASS_Style.prototype.get_MarginR = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_MarginR_0(self);
};
ASS_Style.prototype['set_MarginR'] = ASS_Style.prototype.set_MarginR = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_MarginR_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'MarginR', {
  get: ASS_Style.prototype.get_MarginR,
  set: ASS_Style.prototype.set_MarginR,
});
ASS_Style.prototype['get_MarginV'] = ASS_Style.prototype.get_MarginV = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_MarginV_0(self);
};
ASS_Style.prototype['set_MarginV'] = ASS_Style.prototype.set_MarginV = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_MarginV_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'MarginV', {
  get: ASS_Style.prototype.get_MarginV,
  set: ASS_Style.prototype.set_MarginV,
});
ASS_Style.prototype['get_Encoding'] = ASS_Style.prototype.get_Encoding = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Encoding_0(self);
};
ASS_Style.prototype['set_Encoding'] = ASS_Style.prototype.set_Encoding = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Encoding_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Encoding', {
  get: ASS_Style.prototype.get_Encoding,
  set: ASS_Style.prototype.set_Encoding,
});
ASS_Style.prototype['get_treat_fontname_as_pattern'] = ASS_Style.prototype.get_treat_fontname_as_pattern = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_treat_fontname_as_pattern_0(self);
};
ASS_Style.prototype['set_treat_fontname_as_pattern'] = ASS_Style.prototype.set_treat_fontname_as_pattern = function (
  arg0
) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_treat_fontname_as_pattern_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'treat_fontname_as_pattern', {
  get: ASS_Style.prototype.get_treat_fontname_as_pattern,
  set: ASS_Style.prototype.set_treat_fontname_as_pattern,
});
ASS_Style.prototype['get_Blur'] = ASS_Style.prototype.get_Blur = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Blur_0(self);
};
ASS_Style.prototype['set_Blur'] = ASS_Style.prototype.set_Blur = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Blur_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Blur', {
  get: ASS_Style.prototype.get_Blur,
  set: ASS_Style.prototype.set_Blur,
});
ASS_Style.prototype['get_Justify'] = ASS_Style.prototype.get_Justify = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Style_get_Justify_0(self);
};
ASS_Style.prototype['set_Justify'] = ASS_Style.prototype.set_Justify = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Style_set_Justify_1(self, arg0);
};
Object.defineProperty(ASS_Style.prototype, 'Justify', {
  get: ASS_Style.prototype.get_Justify,
  set: ASS_Style.prototype.set_Justify,
});
function ASS_Event() {
  throw 'cannot construct a ASS_Event, no constructor in IDL';
}
ASS_Event.prototype = Object.create(WrapperObject.prototype);
ASS_Event.prototype.constructor = ASS_Event;
ASS_Event.prototype.__class__ = ASS_Event;
ASS_Event.__cache__ = {};
Module['ASS_Event'] = ASS_Event;
ASS_Event.prototype['get_Start'] = ASS_Event.prototype.get_Start = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Start_0(self);
};
ASS_Event.prototype['set_Start'] = ASS_Event.prototype.set_Start = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Start_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'Start', {
  get: ASS_Event.prototype.get_Start,
  set: ASS_Event.prototype.set_Start,
});
ASS_Event.prototype['get_Duration'] = ASS_Event.prototype.get_Duration = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Duration_0(self);
};
ASS_Event.prototype['set_Duration'] = ASS_Event.prototype.set_Duration = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Duration_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'Duration', {
  get: ASS_Event.prototype.get_Duration,
  set: ASS_Event.prototype.set_Duration,
});
ASS_Event.prototype['get_ReadOrder'] = ASS_Event.prototype.get_ReadOrder = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_ReadOrder_0(self);
};
ASS_Event.prototype['set_ReadOrder'] = ASS_Event.prototype.set_ReadOrder = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_ReadOrder_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'ReadOrder', {
  get: ASS_Event.prototype.get_ReadOrder,
  set: ASS_Event.prototype.set_ReadOrder,
});
ASS_Event.prototype['get_Layer'] = ASS_Event.prototype.get_Layer = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Layer_0(self);
};
ASS_Event.prototype['set_Layer'] = ASS_Event.prototype.set_Layer = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Layer_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'Layer', {
  get: ASS_Event.prototype.get_Layer,
  set: ASS_Event.prototype.set_Layer,
});
ASS_Event.prototype['get_Style'] = ASS_Event.prototype.get_Style = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_Style_0(self);
};
ASS_Event.prototype['set_Style'] = ASS_Event.prototype.set_Style = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_Style_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'Style', {
  get: ASS_Event.prototype.get_Style,
  set: ASS_Event.prototype.set_Style,
});
ASS_Event.prototype['get_Name'] = ASS_Event.prototype.get_Name = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Name_0(self));
};
ASS_Event.prototype['set_Name'] = ASS_Event.prototype.set_Name = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Event_set_Name_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'Name', {
  get: ASS_Event.prototype.get_Name,
  set: ASS_Event.prototype.set_Name,
});
ASS_Event.prototype['get_MarginL'] = ASS_Event.prototype.get_MarginL = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_MarginL_0(self);
};
ASS_Event.prototype['set_MarginL'] = ASS_Event.prototype.set_MarginL = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_MarginL_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'MarginL', {
  get: ASS_Event.prototype.get_MarginL,
  set: ASS_Event.prototype.set_MarginL,
});
ASS_Event.prototype['get_MarginR'] = ASS_Event.prototype.get_MarginR = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_MarginR_0(self);
};
ASS_Event.prototype['set_MarginR'] = ASS_Event.prototype.set_MarginR = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_MarginR_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'MarginR', {
  get: ASS_Event.prototype.get_MarginR,
  set: ASS_Event.prototype.set_MarginR,
});
ASS_Event.prototype['get_MarginV'] = ASS_Event.prototype.get_MarginV = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Event_get_MarginV_0(self);
};
ASS_Event.prototype['set_MarginV'] = ASS_Event.prototype.set_MarginV = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Event_set_MarginV_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'MarginV', {
  get: ASS_Event.prototype.get_MarginV,
  set: ASS_Event.prototype.set_MarginV,
});
ASS_Event.prototype['get_Effect'] = ASS_Event.prototype.get_Effect = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Effect_0(self));
};
ASS_Event.prototype['set_Effect'] = ASS_Event.prototype.set_Effect = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Event_set_Effect_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'Effect', {
  get: ASS_Event.prototype.get_Effect,
  set: ASS_Event.prototype.set_Effect,
});
ASS_Event.prototype['get_Text'] = ASS_Event.prototype.get_Text = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Event_get_Text_0(self));
};
ASS_Event.prototype['set_Text'] = ASS_Event.prototype.set_Text = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Event_set_Text_1(self, arg0);
};
Object.defineProperty(ASS_Event.prototype, 'Text', {
  get: ASS_Event.prototype.get_Text,
  set: ASS_Event.prototype.set_Text,
});
function ASS_Track() {
  throw 'cannot construct a ASS_Track, no constructor in IDL';
}
ASS_Track.prototype = Object.create(WrapperObject.prototype);
ASS_Track.prototype.constructor = ASS_Track;
ASS_Track.prototype.__class__ = ASS_Track;
ASS_Track.__cache__ = {};
Module['ASS_Track'] = ASS_Track;
ASS_Track.prototype['get_n_styles'] = ASS_Track.prototype.get_n_styles = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_n_styles_0(self);
};
ASS_Track.prototype['set_n_styles'] = ASS_Track.prototype.set_n_styles = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_n_styles_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'n_styles', {
  get: ASS_Track.prototype.get_n_styles,
  set: ASS_Track.prototype.set_n_styles,
});
ASS_Track.prototype['get_max_styles'] = ASS_Track.prototype.get_max_styles = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_max_styles_0(self);
};
ASS_Track.prototype['set_max_styles'] = ASS_Track.prototype.set_max_styles = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_max_styles_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'max_styles', {
  get: ASS_Track.prototype.get_max_styles,
  set: ASS_Track.prototype.set_max_styles,
});
ASS_Track.prototype['get_n_events'] = ASS_Track.prototype.get_n_events = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_n_events_0(self);
};
ASS_Track.prototype['set_n_events'] = ASS_Track.prototype.set_n_events = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_n_events_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'n_events', {
  get: ASS_Track.prototype.get_n_events,
  set: ASS_Track.prototype.set_n_events,
});
ASS_Track.prototype['get_max_events'] = ASS_Track.prototype.get_max_events = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_max_events_0(self);
};
ASS_Track.prototype['set_max_events'] = ASS_Track.prototype.set_max_events = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_max_events_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'max_events', {
  get: ASS_Track.prototype.get_max_events,
  set: ASS_Track.prototype.set_max_events,
});
ASS_Track.prototype['get_styles'] = ASS_Track.prototype.get_styles = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_ASS_Track_get_styles_1(self, arg0), ASS_Style);
};
ASS_Track.prototype['set_styles'] = ASS_Track.prototype.set_styles = function (arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_ASS_Track_set_styles_2(self, arg0, arg1);
};
Object.defineProperty(ASS_Track.prototype, 'styles', {
  get: ASS_Track.prototype.get_styles,
  set: ASS_Track.prototype.set_styles,
});
ASS_Track.prototype['get_events'] = ASS_Track.prototype.get_events = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return wrapPointer(_emscripten_bind_ASS_Track_get_events_1(self, arg0), ASS_Event);
};
ASS_Track.prototype['set_events'] = ASS_Track.prototype.set_events = function (arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_ASS_Track_set_events_2(self, arg0, arg1);
};
Object.defineProperty(ASS_Track.prototype, 'events', {
  get: ASS_Track.prototype.get_events,
  set: ASS_Track.prototype.set_events,
});
ASS_Track.prototype['get_style_format'] = ASS_Track.prototype.get_style_format = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_style_format_0(self));
};
ASS_Track.prototype['set_style_format'] = ASS_Track.prototype.set_style_format = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_style_format_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'style_format', {
  get: ASS_Track.prototype.get_style_format,
  set: ASS_Track.prototype.set_style_format,
});
ASS_Track.prototype['get_event_format'] = ASS_Track.prototype.get_event_format = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_event_format_0(self));
};
ASS_Track.prototype['set_event_format'] = ASS_Track.prototype.set_event_format = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_event_format_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'event_format', {
  get: ASS_Track.prototype.get_event_format,
  set: ASS_Track.prototype.set_event_format,
});
ASS_Track.prototype['get_PlayResX'] = ASS_Track.prototype.get_PlayResX = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_PlayResX_0(self);
};
ASS_Track.prototype['set_PlayResX'] = ASS_Track.prototype.set_PlayResX = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_PlayResX_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'PlayResX', {
  get: ASS_Track.prototype.get_PlayResX,
  set: ASS_Track.prototype.set_PlayResX,
});
ASS_Track.prototype['get_PlayResY'] = ASS_Track.prototype.get_PlayResY = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_PlayResY_0(self);
};
ASS_Track.prototype['set_PlayResY'] = ASS_Track.prototype.set_PlayResY = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_PlayResY_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'PlayResY', {
  get: ASS_Track.prototype.get_PlayResY,
  set: ASS_Track.prototype.set_PlayResY,
});
ASS_Track.prototype['get_Timer'] = ASS_Track.prototype.get_Timer = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_Timer_0(self);
};
ASS_Track.prototype['set_Timer'] = ASS_Track.prototype.set_Timer = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_Timer_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'Timer', {
  get: ASS_Track.prototype.get_Timer,
  set: ASS_Track.prototype.set_Timer,
});
ASS_Track.prototype['get_WrapStyle'] = ASS_Track.prototype.get_WrapStyle = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_WrapStyle_0(self);
};
ASS_Track.prototype['set_WrapStyle'] = ASS_Track.prototype.set_WrapStyle = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_WrapStyle_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'WrapStyle', {
  get: ASS_Track.prototype.get_WrapStyle,
  set: ASS_Track.prototype.set_WrapStyle,
});
ASS_Track.prototype['get_ScaledBorderAndShadow'] = ASS_Track.prototype.get_ScaledBorderAndShadow = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_ScaledBorderAndShadow_0(self);
};
ASS_Track.prototype['set_ScaledBorderAndShadow'] = ASS_Track.prototype.set_ScaledBorderAndShadow = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_ScaledBorderAndShadow_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'ScaledBorderAndShadow', {
  get: ASS_Track.prototype.get_ScaledBorderAndShadow,
  set: ASS_Track.prototype.set_ScaledBorderAndShadow,
});
ASS_Track.prototype['get_Kerning'] = ASS_Track.prototype.get_Kerning = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_Kerning_0(self);
};
ASS_Track.prototype['set_Kerning'] = ASS_Track.prototype.set_Kerning = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_Kerning_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'Kerning', {
  get: ASS_Track.prototype.get_Kerning,
  set: ASS_Track.prototype.set_Kerning,
});
ASS_Track.prototype['get_Language'] = ASS_Track.prototype.get_Language = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_Language_0(self));
};
ASS_Track.prototype['set_Language'] = ASS_Track.prototype.set_Language = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_Language_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'Language', {
  get: ASS_Track.prototype.get_Language,
  set: ASS_Track.prototype.set_Language,
});
ASS_Track.prototype['get_default_style'] = ASS_Track.prototype.get_default_style = function () {
  var self = this.ptr;
  return _emscripten_bind_ASS_Track_get_default_style_0(self);
};
ASS_Track.prototype['set_default_style'] = ASS_Track.prototype.set_default_style = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_ASS_Track_set_default_style_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'default_style', {
  get: ASS_Track.prototype.get_default_style,
  set: ASS_Track.prototype.set_default_style,
});
ASS_Track.prototype['get_name'] = ASS_Track.prototype.get_name = function () {
  var self = this.ptr;
  return UTF8ToString(_emscripten_bind_ASS_Track_get_name_0(self));
};
ASS_Track.prototype['set_name'] = ASS_Track.prototype.set_name = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, true);
  _emscripten_bind_ASS_Track_set_name_1(self, arg0);
};
Object.defineProperty(ASS_Track.prototype, 'name', {
  get: ASS_Track.prototype.get_name,
  set: ASS_Track.prototype.set_name,
});
function ASS_Library() {
  throw 'cannot construct a ASS_Library, no constructor in IDL';
}
ASS_Library.prototype = Object.create(WrapperObject.prototype);
ASS_Library.prototype.constructor = ASS_Library;
ASS_Library.prototype.__class__ = ASS_Library;
ASS_Library.__cache__ = {};
Module['ASS_Library'] = ASS_Library;
function ASS_RenderPriv() {
  throw 'cannot construct a ASS_RenderPriv, no constructor in IDL';
}
ASS_RenderPriv.prototype = Object.create(WrapperObject.prototype);
ASS_RenderPriv.prototype.constructor = ASS_RenderPriv;
ASS_RenderPriv.prototype.__class__ = ASS_RenderPriv;
ASS_RenderPriv.__cache__ = {};
Module['ASS_RenderPriv'] = ASS_RenderPriv;
function ASS_ParserPriv() {
  throw 'cannot construct a ASS_ParserPriv, no constructor in IDL';
}
ASS_ParserPriv.prototype = Object.create(WrapperObject.prototype);
ASS_ParserPriv.prototype.constructor = ASS_ParserPriv;
ASS_ParserPriv.prototype.__class__ = ASS_ParserPriv;
ASS_ParserPriv.__cache__ = {};
Module['ASS_ParserPriv'] = ASS_ParserPriv;
function ASS_Renderer() {
  throw 'cannot construct a ASS_Renderer, no constructor in IDL';
}
ASS_Renderer.prototype = Object.create(WrapperObject.prototype);
ASS_Renderer.prototype.constructor = ASS_Renderer;
ASS_Renderer.prototype.__class__ = ASS_Renderer;
ASS_Renderer.__cache__ = {};
Module['ASS_Renderer'] = ASS_Renderer;
function libass() {
  this.ptr = _emscripten_bind_libass_libass_0();
  getCache(libass)[this.ptr] = this;
}
libass.prototype = Object.create(WrapperObject.prototype);
libass.prototype.constructor = libass;
libass.prototype.__class__ = libass;
libass.__cache__ = {};
Module['libass'] = libass;
libass.prototype['oct_library_version'] = libass.prototype.oct_library_version = function () {
  var self = this.ptr;
  return _emscripten_bind_libass_oct_library_version_0(self);
};
libass.prototype['oct_library_init'] = libass.prototype.oct_library_init = function () {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_library_init_0(self), ASS_Library);
};
libass.prototype['oct_library_done'] = libass.prototype.oct_library_done = function (priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  _emscripten_bind_libass_oct_library_done_1(self, priv);
};
libass.prototype['oct_set_fonts_dir'] = libass.prototype.oct_set_fonts_dir = function (priv, fonts_dir) {
  var self = this.ptr;
  ensureCache.prepare();
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (fonts_dir && typeof fonts_dir === 'object') fonts_dir = fonts_dir.ptr;
  else fonts_dir = ensureString(fonts_dir, false);
  _emscripten_bind_libass_oct_set_fonts_dir_2(self, priv, fonts_dir);
};
libass.prototype['oct_set_extract_fonts'] = libass.prototype.oct_set_extract_fonts = function (priv, extract) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (extract && typeof extract === 'object') extract = extract.ptr;
  _emscripten_bind_libass_oct_set_extract_fonts_2(self, priv, extract);
};
libass.prototype['oct_set_style_overrides'] = libass.prototype.oct_set_style_overrides = function (priv, list) {
  var self = this.ptr;
  ensureCache.prepare();
  if (priv && typeof priv === 'object') priv = priv.ptr;
  _emscripten_bind_libass_oct_set_style_overrides_2(self, priv, list);
};
libass.prototype['oct_process_force_style'] = libass.prototype.oct_process_force_style = function (track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  _emscripten_bind_libass_oct_process_force_style_1(self, track);
};
libass.prototype['oct_renderer_init'] = libass.prototype.oct_renderer_init = function (priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_renderer_init_1(self, priv), ASS_Renderer);
};
libass.prototype['oct_renderer_done'] = libass.prototype.oct_renderer_done = function (priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  _emscripten_bind_libass_oct_renderer_done_1(self, priv);
};
libass.prototype['oct_set_frame_size'] = libass.prototype.oct_set_frame_size = function (priv, w, h) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (w && typeof w === 'object') w = w.ptr;
  if (h && typeof h === 'object') h = h.ptr;
  _emscripten_bind_libass_oct_set_frame_size_3(self, priv, w, h);
};
libass.prototype['oct_set_storage_size'] = libass.prototype.oct_set_storage_size = function (priv, w, h) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (w && typeof w === 'object') w = w.ptr;
  if (h && typeof h === 'object') h = h.ptr;
  _emscripten_bind_libass_oct_set_storage_size_3(self, priv, w, h);
};
libass.prototype['oct_set_shaper'] = libass.prototype.oct_set_shaper = function (priv, level) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  _emscripten_bind_libass_oct_set_shaper_2(self, priv, level);
};
libass.prototype['oct_set_margins'] = libass.prototype.oct_set_margins = function (priv, t, b, l, r) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (t && typeof t === 'object') t = t.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  if (l && typeof l === 'object') l = l.ptr;
  if (r && typeof r === 'object') r = r.ptr;
  _emscripten_bind_libass_oct_set_margins_5(self, priv, t, b, l, r);
};
libass.prototype['oct_set_use_margins'] = libass.prototype.oct_set_use_margins = function (priv, use) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (use && typeof use === 'object') use = use.ptr;
  _emscripten_bind_libass_oct_set_use_margins_2(self, priv, use);
};
libass.prototype['oct_set_pixel_aspect'] = libass.prototype.oct_set_pixel_aspect = function (priv, par) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (par && typeof par === 'object') par = par.ptr;
  _emscripten_bind_libass_oct_set_pixel_aspect_2(self, priv, par);
};
libass.prototype['oct_set_aspect_ratio'] = libass.prototype.oct_set_aspect_ratio = function (priv, dar, sar) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (dar && typeof dar === 'object') dar = dar.ptr;
  if (sar && typeof sar === 'object') sar = sar.ptr;
  _emscripten_bind_libass_oct_set_aspect_ratio_3(self, priv, dar, sar);
};
libass.prototype['oct_set_font_scale'] = libass.prototype.oct_set_font_scale = function (priv, font_scale) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (font_scale && typeof font_scale === 'object') font_scale = font_scale.ptr;
  _emscripten_bind_libass_oct_set_font_scale_2(self, priv, font_scale);
};
libass.prototype['oct_set_hinting'] = libass.prototype.oct_set_hinting = function (priv, ht) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (ht && typeof ht === 'object') ht = ht.ptr;
  _emscripten_bind_libass_oct_set_hinting_2(self, priv, ht);
};
libass.prototype['oct_set_line_spacing'] = libass.prototype.oct_set_line_spacing = function (priv, line_spacing) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (line_spacing && typeof line_spacing === 'object') line_spacing = line_spacing.ptr;
  _emscripten_bind_libass_oct_set_line_spacing_2(self, priv, line_spacing);
};
libass.prototype['oct_set_line_position'] = libass.prototype.oct_set_line_position = function (priv, line_position) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (line_position && typeof line_position === 'object') line_position = line_position.ptr;
  _emscripten_bind_libass_oct_set_line_position_2(self, priv, line_position);
};
libass.prototype['oct_set_fonts'] = libass.prototype.oct_set_fonts = function (
  priv,
  default_font,
  default_family,
  dfp,
  config,
  update
) {
  var self = this.ptr;
  ensureCache.prepare();
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (default_font && typeof default_font === 'object') default_font = default_font.ptr;
  else default_font = ensureString(default_font, false);
  if (default_family && typeof default_family === 'object') default_family = default_family.ptr;
  else default_family = ensureString(default_family, false);
  if (dfp && typeof dfp === 'object') dfp = dfp.ptr;
  if (config && typeof config === 'object') config = config.ptr;
  else config = ensureString(config, false);
  if (update && typeof update === 'object') update = update.ptr;
  _emscripten_bind_libass_oct_set_fonts_6(self, priv, default_font, default_family, dfp, config, update);
};
libass.prototype['oct_set_selective_style_override_enabled'] =
  libass.prototype.oct_set_selective_style_override_enabled = function (priv, bits) {
    var self = this.ptr;
    if (priv && typeof priv === 'object') priv = priv.ptr;
    if (bits && typeof bits === 'object') bits = bits.ptr;
    _emscripten_bind_libass_oct_set_selective_style_override_enabled_2(self, priv, bits);
  };
libass.prototype['oct_set_selective_style_override'] = libass.prototype.oct_set_selective_style_override = function (
  priv,
  style
) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (style && typeof style === 'object') style = style.ptr;
  _emscripten_bind_libass_oct_set_selective_style_override_2(self, priv, style);
};
libass.prototype['oct_set_cache_limits'] = libass.prototype.oct_set_cache_limits = function (
  priv,
  glyph_max,
  bitmap_max_size
) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (glyph_max && typeof glyph_max === 'object') glyph_max = glyph_max.ptr;
  if (bitmap_max_size && typeof bitmap_max_size === 'object') bitmap_max_size = bitmap_max_size.ptr;
  _emscripten_bind_libass_oct_set_cache_limits_3(self, priv, glyph_max, bitmap_max_size);
};
libass.prototype['oct_render_frame'] = libass.prototype.oct_render_frame = function (priv, track, now, detect_change) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (now && typeof now === 'object') now = now.ptr;
  if (detect_change && typeof detect_change === 'object') detect_change = detect_change.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_render_frame_4(self, priv, track, now, detect_change), ASS_Image);
};
libass.prototype['oct_new_track'] = libass.prototype.oct_new_track = function (priv) {
  var self = this.ptr;
  if (priv && typeof priv === 'object') priv = priv.ptr;
  return wrapPointer(_emscripten_bind_libass_oct_new_track_1(self, priv), ASS_Track);
};
libass.prototype['oct_free_track'] = libass.prototype.oct_free_track = function (track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  _emscripten_bind_libass_oct_free_track_1(self, track);
};
libass.prototype['oct_alloc_style'] = libass.prototype.oct_alloc_style = function (track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  return _emscripten_bind_libass_oct_alloc_style_1(self, track);
};
libass.prototype['oct_alloc_event'] = libass.prototype.oct_alloc_event = function (track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  return _emscripten_bind_libass_oct_alloc_event_1(self, track);
};
libass.prototype['oct_free_style'] = libass.prototype.oct_free_style = function (track, sid) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (sid && typeof sid === 'object') sid = sid.ptr;
  _emscripten_bind_libass_oct_free_style_2(self, track, sid);
};
libass.prototype['oct_free_event'] = libass.prototype.oct_free_event = function (track, eid) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (eid && typeof eid === 'object') eid = eid.ptr;
  _emscripten_bind_libass_oct_free_event_2(self, track, eid);
};
libass.prototype['oct_flush_events'] = libass.prototype.oct_flush_events = function (track) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  _emscripten_bind_libass_oct_flush_events_1(self, track);
};
libass.prototype['oct_read_file'] = libass.prototype.oct_read_file = function (library, fname, codepage) {
  var self = this.ptr;
  ensureCache.prepare();
  if (library && typeof library === 'object') library = library.ptr;
  if (fname && typeof fname === 'object') fname = fname.ptr;
  else fname = ensureString(fname, false);
  if (codepage && typeof codepage === 'object') codepage = codepage.ptr;
  else codepage = ensureString(codepage, false);
  return wrapPointer(_emscripten_bind_libass_oct_read_file_3(self, library, fname, codepage), ASS_Track);
};
libass.prototype['oct_add_font'] = libass.prototype.oct_add_font = function (library, name, data, data_size) {
  var self = this.ptr;
  ensureCache.prepare();
  if (library && typeof library === 'object') library = library.ptr;
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name, false);
  if (data && typeof data === 'object') data = data.ptr;
  else data = ensureString(data, false);
  if (data_size && typeof data_size === 'object') data_size = data_size.ptr;
  _emscripten_bind_libass_oct_add_font_4(self, library, name, data, data_size);
};
libass.prototype['oct_clear_fonts'] = libass.prototype.oct_clear_fonts = function (library) {
  var self = this.ptr;
  if (library && typeof library === 'object') library = library.ptr;
  _emscripten_bind_libass_oct_clear_fonts_1(self, library);
};
libass.prototype['oct_step_sub'] = libass.prototype.oct_step_sub = function (track, now, movement) {
  var self = this.ptr;
  if (track && typeof track === 'object') track = track.ptr;
  if (now && typeof now === 'object') now = now.ptr;
  if (movement && typeof movement === 'object') movement = movement.ptr;
  return _emscripten_bind_libass_oct_step_sub_3(self, track, now, movement);
};
function RenderBlendResult() {
  throw 'cannot construct a RenderBlendResult, no constructor in IDL';
}
RenderBlendResult.prototype = Object.create(WrapperObject.prototype);
RenderBlendResult.prototype.constructor = RenderBlendResult;
RenderBlendResult.prototype.__class__ = RenderBlendResult;
RenderBlendResult.__cache__ = {};
Module['RenderBlendResult'] = RenderBlendResult;
RenderBlendResult.prototype['get_changed'] = RenderBlendResult.prototype.get_changed = function () {
  var self = this.ptr;
  return _emscripten_bind_RenderBlendResult_get_changed_0(self);
};
RenderBlendResult.prototype['set_changed'] = RenderBlendResult.prototype.set_changed = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderBlendResult_set_changed_1(self, arg0);
};
Object.defineProperty(RenderBlendResult.prototype, 'changed', {
  get: RenderBlendResult.prototype.get_changed,
  set: RenderBlendResult.prototype.set_changed,
});
RenderBlendResult.prototype['get_blend_time'] = RenderBlendResult.prototype.get_blend_time = function () {
  var self = this.ptr;
  return _emscripten_bind_RenderBlendResult_get_blend_time_0(self);
};
RenderBlendResult.prototype['set_blend_time'] = RenderBlendResult.prototype.set_blend_time = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderBlendResult_set_blend_time_1(self, arg0);
};
Object.defineProperty(RenderBlendResult.prototype, 'blend_time', {
  get: RenderBlendResult.prototype.get_blend_time,
  set: RenderBlendResult.prototype.set_blend_time,
});
RenderBlendResult.prototype['get_dest_x'] = RenderBlendResult.prototype.get_dest_x = function () {
  var self = this.ptr;
  return _emscripten_bind_RenderBlendResult_get_dest_x_0(self);
};
RenderBlendResult.prototype['set_dest_x'] = RenderBlendResult.prototype.set_dest_x = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderBlendResult_set_dest_x_1(self, arg0);
};
Object.defineProperty(RenderBlendResult.prototype, 'dest_x', {
  get: RenderBlendResult.prototype.get_dest_x,
  set: RenderBlendResult.prototype.set_dest_x,
});
RenderBlendResult.prototype['get_dest_y'] = RenderBlendResult.prototype.get_dest_y = function () {
  var self = this.ptr;
  return _emscripten_bind_RenderBlendResult_get_dest_y_0(self);
};
RenderBlendResult.prototype['set_dest_y'] = RenderBlendResult.prototype.set_dest_y = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderBlendResult_set_dest_y_1(self, arg0);
};
Object.defineProperty(RenderBlendResult.prototype, 'dest_y', {
  get: RenderBlendResult.prototype.get_dest_y,
  set: RenderBlendResult.prototype.set_dest_y,
});
RenderBlendResult.prototype['get_dest_width'] = RenderBlendResult.prototype.get_dest_width = function () {
  var self = this.ptr;
  return _emscripten_bind_RenderBlendResult_get_dest_width_0(self);
};
RenderBlendResult.prototype['set_dest_width'] = RenderBlendResult.prototype.set_dest_width = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderBlendResult_set_dest_width_1(self, arg0);
};
Object.defineProperty(RenderBlendResult.prototype, 'dest_width', {
  get: RenderBlendResult.prototype.get_dest_width,
  set: RenderBlendResult.prototype.set_dest_width,
});
RenderBlendResult.prototype['get_dest_height'] = RenderBlendResult.prototype.get_dest_height = function () {
  var self = this.ptr;
  return _emscripten_bind_RenderBlendResult_get_dest_height_0(self);
};
RenderBlendResult.prototype['set_dest_height'] = RenderBlendResult.prototype.set_dest_height = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_RenderBlendResult_set_dest_height_1(self, arg0);
};
Object.defineProperty(RenderBlendResult.prototype, 'dest_height', {
  get: RenderBlendResult.prototype.get_dest_height,
  set: RenderBlendResult.prototype.set_dest_height,
});
RenderBlendResult.prototype['get_image'] = RenderBlendResult.prototype.get_image = function () {
  var self = this.ptr;
  return _emscripten_bind_RenderBlendResult_get_image_0(self);
};
RenderBlendResult.prototype['set_image'] = RenderBlendResult.prototype.set_image = function (arg0) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  else arg0 = ensureString(arg0, false);
  _emscripten_bind_RenderBlendResult_set_image_1(self, arg0);
};
Object.defineProperty(RenderBlendResult.prototype, 'image', {
  get: RenderBlendResult.prototype.get_image,
  set: RenderBlendResult.prototype.set_image,
});
function SubtitleOctopus() {
  this.ptr = _emscripten_bind_SubtitleOctopus_SubtitleOctopus_0();
  getCache(SubtitleOctopus)[this.ptr] = this;
}
SubtitleOctopus.prototype = Object.create(WrapperObject.prototype);
SubtitleOctopus.prototype.constructor = SubtitleOctopus;
SubtitleOctopus.prototype.__class__ = SubtitleOctopus;
SubtitleOctopus.__cache__ = {};
Module['SubtitleOctopus'] = SubtitleOctopus;
SubtitleOctopus.prototype['setLogLevel'] = SubtitleOctopus.prototype.setLogLevel = function (level) {
  var self = this.ptr;
  if (level && typeof level === 'object') level = level.ptr;
  _emscripten_bind_SubtitleOctopus_setLogLevel_1(self, level);
};
SubtitleOctopus.prototype['setDropAnimations'] = SubtitleOctopus.prototype.setDropAnimations = function (value) {
  var self = this.ptr;
  if (value && typeof value === 'object') value = value.ptr;
  _emscripten_bind_SubtitleOctopus_setDropAnimations_1(self, value);
};
SubtitleOctopus.prototype['initLibrary'] = SubtitleOctopus.prototype.initLibrary = function (
  frame_w,
  frame_h,
  default_font
) {
  var self = this.ptr;
  ensureCache.prepare();
  if (frame_w && typeof frame_w === 'object') frame_w = frame_w.ptr;
  if (frame_h && typeof frame_h === 'object') frame_h = frame_h.ptr;
  if (default_font && typeof default_font === 'object') default_font = default_font.ptr;
  else default_font = ensureString(default_font, false);
  _emscripten_bind_SubtitleOctopus_initLibrary_3(self, frame_w, frame_h, default_font);
};
SubtitleOctopus.prototype['createTrack'] = SubtitleOctopus.prototype.createTrack = function (subfile) {
  var self = this.ptr;
  ensureCache.prepare();
  if (subfile && typeof subfile === 'object') subfile = subfile.ptr;
  else subfile = ensureString(subfile, false);
  _emscripten_bind_SubtitleOctopus_createTrack_1(self, subfile);
};
SubtitleOctopus.prototype['createTrackMem'] = SubtitleOctopus.prototype.createTrackMem = function (buf, bufsize) {
  var self = this.ptr;
  ensureCache.prepare();
  if (buf && typeof buf === 'object') buf = buf.ptr;
  else buf = ensureString(buf, false);
  if (bufsize && typeof bufsize === 'object') bufsize = bufsize.ptr;
  _emscripten_bind_SubtitleOctopus_createTrackMem_2(self, buf, bufsize);
};
SubtitleOctopus.prototype['removeTrack'] = SubtitleOctopus.prototype.removeTrack = function () {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_removeTrack_0(self);
};
SubtitleOctopus.prototype['resizeCanvas'] = SubtitleOctopus.prototype.resizeCanvas = function (frame_w, frame_h) {
  var self = this.ptr;
  if (frame_w && typeof frame_w === 'object') frame_w = frame_w.ptr;
  if (frame_h && typeof frame_h === 'object') frame_h = frame_h.ptr;
  _emscripten_bind_SubtitleOctopus_resizeCanvas_2(self, frame_w, frame_h);
};
SubtitleOctopus.prototype['renderImage'] = SubtitleOctopus.prototype.renderImage = function (time, changed) {
  var self = this.ptr;
  if (time && typeof time === 'object') time = time.ptr;
  if (changed && typeof changed === 'object') changed = changed.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_renderImage_2(self, time, changed), ASS_Image);
};
SubtitleOctopus.prototype['quitLibrary'] = SubtitleOctopus.prototype.quitLibrary = function () {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_quitLibrary_0(self);
};
SubtitleOctopus.prototype['reloadLibrary'] = SubtitleOctopus.prototype.reloadLibrary = function () {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_reloadLibrary_0(self);
};
SubtitleOctopus.prototype['reloadFonts'] = SubtitleOctopus.prototype.reloadFonts = function () {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_reloadFonts_0(self);
};
SubtitleOctopus.prototype['setMargin'] = SubtitleOctopus.prototype.setMargin = function (top, bottom, left, right) {
  var self = this.ptr;
  if (top && typeof top === 'object') top = top.ptr;
  if (bottom && typeof bottom === 'object') bottom = bottom.ptr;
  if (left && typeof left === 'object') left = left.ptr;
  if (right && typeof right === 'object') right = right.ptr;
  _emscripten_bind_SubtitleOctopus_setMargin_4(self, top, bottom, left, right);
};
SubtitleOctopus.prototype['getEventCount'] = SubtitleOctopus.prototype.getEventCount = function () {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_getEventCount_0(self);
};
SubtitleOctopus.prototype['allocEvent'] = SubtitleOctopus.prototype.allocEvent = function () {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_allocEvent_0(self);
};
SubtitleOctopus.prototype['allocStyle'] = SubtitleOctopus.prototype.allocStyle = function () {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_allocStyle_0(self);
};
SubtitleOctopus.prototype['removeEvent'] = SubtitleOctopus.prototype.removeEvent = function (eid) {
  var self = this.ptr;
  if (eid && typeof eid === 'object') eid = eid.ptr;
  _emscripten_bind_SubtitleOctopus_removeEvent_1(self, eid);
};
SubtitleOctopus.prototype['getStyleCount'] = SubtitleOctopus.prototype.getStyleCount = function () {
  var self = this.ptr;
  return _emscripten_bind_SubtitleOctopus_getStyleCount_0(self);
};
SubtitleOctopus.prototype['getStyleByName'] = SubtitleOctopus.prototype.getStyleByName = function (name) {
  var self = this.ptr;
  ensureCache.prepare();
  if (name && typeof name === 'object') name = name.ptr;
  else name = ensureString(name, false);
  return _emscripten_bind_SubtitleOctopus_getStyleByName_1(self, name);
};
SubtitleOctopus.prototype['removeStyle'] = SubtitleOctopus.prototype.removeStyle = function (eid) {
  var self = this.ptr;
  if (eid && typeof eid === 'object') eid = eid.ptr;
  _emscripten_bind_SubtitleOctopus_removeStyle_1(self, eid);
};
SubtitleOctopus.prototype['removeAllEvents'] = SubtitleOctopus.prototype.removeAllEvents = function () {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus_removeAllEvents_0(self);
};
SubtitleOctopus.prototype['setMemoryLimits'] = SubtitleOctopus.prototype.setMemoryLimits = function (
  glyph_limit,
  bitmap_cache_limit
) {
  var self = this.ptr;
  if (glyph_limit && typeof glyph_limit === 'object') glyph_limit = glyph_limit.ptr;
  if (bitmap_cache_limit && typeof bitmap_cache_limit === 'object') bitmap_cache_limit = bitmap_cache_limit.ptr;
  _emscripten_bind_SubtitleOctopus_setMemoryLimits_2(self, glyph_limit, bitmap_cache_limit);
};
SubtitleOctopus.prototype['renderBlend'] = SubtitleOctopus.prototype.renderBlend = function (tm, force) {
  var self = this.ptr;
  if (tm && typeof tm === 'object') tm = tm.ptr;
  if (force && typeof force === 'object') force = force.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_renderBlend_2(self, tm, force), RenderBlendResult);
};
SubtitleOctopus.prototype['get_track'] = SubtitleOctopus.prototype.get_track = function () {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_track_0(self), ASS_Track);
};
SubtitleOctopus.prototype['set_track'] = SubtitleOctopus.prototype.set_track = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_SubtitleOctopus_set_track_1(self, arg0);
};
Object.defineProperty(SubtitleOctopus.prototype, 'track', {
  get: SubtitleOctopus.prototype.get_track,
  set: SubtitleOctopus.prototype.set_track,
});
SubtitleOctopus.prototype['get_ass_renderer'] = SubtitleOctopus.prototype.get_ass_renderer = function () {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_ass_renderer_0(self), ASS_Renderer);
};
SubtitleOctopus.prototype['set_ass_renderer'] = SubtitleOctopus.prototype.set_ass_renderer = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_SubtitleOctopus_set_ass_renderer_1(self, arg0);
};
Object.defineProperty(SubtitleOctopus.prototype, 'ass_renderer', {
  get: SubtitleOctopus.prototype.get_ass_renderer,
  set: SubtitleOctopus.prototype.set_ass_renderer,
});
SubtitleOctopus.prototype['get_ass_library'] = SubtitleOctopus.prototype.get_ass_library = function () {
  var self = this.ptr;
  return wrapPointer(_emscripten_bind_SubtitleOctopus_get_ass_library_0(self), ASS_Library);
};
SubtitleOctopus.prototype['set_ass_library'] = SubtitleOctopus.prototype.set_ass_library = function (arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_SubtitleOctopus_set_ass_library_1(self, arg0);
};
Object.defineProperty(SubtitleOctopus.prototype, 'ass_library', {
  get: SubtitleOctopus.prototype.get_ass_library,
  set: SubtitleOctopus.prototype.set_ass_library,
});
SubtitleOctopus.prototype['__destroy__'] = SubtitleOctopus.prototype.__destroy__ = function () {
  var self = this.ptr;
  _emscripten_bind_SubtitleOctopus___destroy___0(self);
};
(function () {
  function setupEnums() {
    Module['ASS_HINTING_NONE'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_NONE();
    Module['ASS_HINTING_LIGHT'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_LIGHT();
    Module['ASS_HINTING_NORMAL'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_NORMAL();
    Module['ASS_HINTING_NATIVE'] = _emscripten_enum_ASS_Hinting_ASS_HINTING_NATIVE();
    Module['ASS_SHAPING_SIMPLE'] = _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_SIMPLE();
    Module['ASS_SHAPING_COMPLEX'] = _emscripten_enum_ASS_ShapingLevel_ASS_SHAPING_COMPLEX();
    Module['ASS_OVERRIDE_DEFAULT'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_DEFAULT();
    Module['ASS_OVERRIDE_BIT_STYLE'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_STYLE();
    Module['ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE'] =
      _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_SELECTIVE_FONT_SCALE();
    Module['ASS_OVERRIDE_BIT_FONT_SIZE'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE();
    Module['ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_SIZE_FIELDS();
    Module['ASS_OVERRIDE_BIT_FONT_NAME'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_FONT_NAME();
    Module['ASS_OVERRIDE_BIT_COLORS'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_COLORS();
    Module['ASS_OVERRIDE_BIT_ATTRIBUTES'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ATTRIBUTES();
    Module['ASS_OVERRIDE_BIT_BORDER'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_BORDER();
    Module['ASS_OVERRIDE_BIT_ALIGNMENT'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_ALIGNMENT();
    Module['ASS_OVERRIDE_BIT_MARGINS'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_MARGINS();
    Module['ASS_OVERRIDE_FULL_STYLE'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_FULL_STYLE();
    Module['ASS_OVERRIDE_BIT_JUSTIFY'] = _emscripten_enum_ASS_OverrideBits_ASS_OVERRIDE_BIT_JUSTIFY();
  }
  if (runtimeInitialized) setupEnums();
  else addOnInit(setupEnums);
})();
Module['FS'] = FS;
self.delay = 0;
self.lastCurrentTime = 0;
self.rate = 1;
self.rafId = null;
self.nextIsRaf = false;
self.lastCurrentTimeReceivedAt = Date.now;
self.targetFps = 24;
self.libassMemoryLimit = 0;
self.dropAllAnimations = false;
self.width = 0;
self.height = 0;
self.fontMap_ = {};
self.fontId = 0;
self.writeFontToFS = function (font) {
  font = font.trim().toLowerCase();
  if (font.startsWith('@')) {
    font = font.substr(1);
  }
  if (self.fontMap_.hasOwnProperty(font)) return;
  self.fontMap_[font] = true;
  if (!self.availableFonts.hasOwnProperty(font)) return;
  self.loadFontFile('font' + self.fontId++ + '-', self.availableFonts[font]);
};
self.loadFontFile = function (fontId, path) {
  if (self.lazyFileLoading && path.indexOf('blob:') !== 0) {
    Module['FS'].createLazyFile('/fonts', fontId + path.split('/').pop(), path, true, false);
  } else {
    Module['FS'].createPreloadedFile('/fonts', fontId + path.split('/').pop(), path, true, false);
  }
};
self.writeAvailableFontsToFS = function (content) {
  if (!self.availableFonts) return;
  var sections = parseAss(content);
  for (var i = 0; i < sections.length; i++) {
    for (var j = 0; j < sections[i].body.length; j++) {
      if (sections[i].body[j].key === 'Style') {
        self.writeFontToFS(sections[i].body[j].value['Fontname']);
      }
    }
  }
  var regex = /\\fn([^\\}]*?)[\\}]/g;
  var matches;
  while ((matches = regex.exec(self.subContent))) {
    self.writeFontToFS(matches[1]);
  }
};
self.getRenderMethod = function () {
  switch (self.renderMode) {
    case 'lossy':
      return self.lossyRender;
    case 'js-blend':
      return self.render;
    default:
      console.error('Unrecognised renderMode, falling back to default!');
      self.renderMode = 'wasm-blend';
    case 'wasm-blend':
      return self.blendRender;
  }
};
self.setTrack = function (content) {
  self.writeAvailableFontsToFS(content);
  Module['FS'].writeFile('/sub.ass', content);
  self.octObj.createTrack('/sub.ass');
  self.ass_track = self.octObj.track;
  self.ass_renderer = self.octObj.ass_renderer;
  self.ass_library = self.octObj.ass_library;
  self.getRenderMethod()();
};
self.freeTrack = function () {
  self.octObj.removeTrack();
  self.getRenderMethod()();
};
self.setTrackByUrl = function (url) {
  var content = '';
  if (isBrotliFile(url)) {
    content = Module['BrotliDecode'](readBinary(url));
  } else {
    content = read_(url);
  }
  self.setTrack(content);
};
self.resize = function (width, height) {
  self.width = width;
  self.height = height;
  self.octObj.resizeCanvas(width, height);
};
self.getCurrentTime = function () {
  var diff = (Date.now - self.lastCurrentTimeReceivedAt) / 1e3;
  if (self._isPaused) {
    return self.lastCurrentTime;
  } else {
    if (diff > 5) {
      console.error("Didn't received currentTime > 5 seconds. Assuming video was paused.");
      self.setIsPaused(true);
    }
    return self.lastCurrentTime + diff * self.rate;
  }
};
self.setCurrentTime = function (currentTime) {
  self.lastCurrentTime = currentTime;
  self.lastCurrentTimeReceivedAt = Date.now;
  if (!self.rafId) {
    if (self.nextIsRaf) {
      self.rafId = self.requestAnimationFrame(self.getRenderMethod());
    } else {
      self.getRenderMethod()();
      setTimeout(function () {
        self.nextIsRaf = false;
      }, 20);
    }
  }
};
self._isPaused = true;
self.getIsPaused = function () {
  return self._isPaused;
};
self.setIsPaused = function (isPaused) {
  if (isPaused != self._isPaused) {
    self._isPaused = isPaused;
    if (isPaused) {
      if (self.rafId) {
        clearTimeout(self.rafId);
        self.rafId = null;
      }
    } else {
      self.lastCurrentTimeReceivedAt = Date.now;
      self.rafId = self.requestAnimationFrame(self.getRenderMethod());
    }
  }
};
self.render = function (force) {
  self.rafId = 0;
  self.renderPending = false;
  var startTime = performance.now();
  var renderResult = self.octObj.renderImage(self.getCurrentTime() + self.delay, self.changed);
  var changed = Module.getValue(self.changed, 'i32');
  if (changed != 0 || force) {
    var result = self.buildResult(renderResult);
    var spentTime = performance.now() - startTime;
    postMessage(
      { target: 'canvas', op: 'renderCanvas', time: Date.now, spentTime: spentTime, canvases: result[0] },
      result[1]
    );
  }
  if (!self._isPaused) {
    self.rafId = self.requestAnimationFrame(self.render);
  }
};
self.blendRender = function (force) {
  self.rafId = 0;
  self.renderPending = false;
  var startTime = performance.now();
  var renderResult = self.octObj.renderBlend(self.getCurrentTime() + self.delay, force);
  if (renderResult.changed != 0 || force) {
    var canvases = [];
    var buffers = [];
    if (renderResult.image) {
      var result = new Uint8Array(
        HEAPU8.subarray(renderResult.image, renderResult.image + renderResult.dest_width * renderResult.dest_height * 4)
      );
      canvases = [
        {
          w: renderResult.dest_width,
          h: renderResult.dest_height,
          x: renderResult.dest_x,
          y: renderResult.dest_y,
          buffer: result.buffer,
        },
      ];
      buffers = [result.buffer];
    }
    postMessage(
      {
        target: 'canvas',
        op: 'renderCanvas',
        time: Date.now,
        spentTime: performance.now() - startTime,
        blendTime: renderResult.blend_time,
        canvases: canvases,
      },
      buffers
    );
  }
  if (!self._isPaused) {
    self.rafId = self.requestAnimationFrame(self.blendRender);
  }
};
self.lossyRender = function (force) {
  self.rafId = 0;
  self.renderPending = false;
  var startTime = performance.now();
  var renderResult = self.octObj.renderImage(self.getCurrentTime() + self.delay, self.changed);
  var changed = Module.getValue(self.changed, 'i32');
  if (changed != 0 || force) {
    var result = self.buildResult(renderResult);
    var newTime = performance.now();
    var libassTime = newTime - startTime;
    var promises = [];
    for (var i = 0; i < result[0].length; i++) {
      var image = result[0][i];
      var imageBuffer = new Uint8ClampedArray(image.buffer);
      var imageData = new ImageData(imageBuffer, image.w, image.h);
      promises[i] = createImageBitmap(imageData, 0, 0, image.w, image.h);
    }
    Promise.all(promises).then(function (imgs) {
      var decodeTime = performance.now() - newTime;
      var bitmaps = [];
      for (var i = 0; i < imgs.length; i++) {
        var image = result[0][i];
        bitmaps[i] = { x: image.x, y: image.y, bitmap: imgs[i] };
      }
      postMessage(
        {
          target: 'canvas',
          op: 'renderFastCanvas',
          time: Date.now,
          libassTime: libassTime,
          decodeTime: decodeTime,
          bitmaps: bitmaps,
        },
        imgs
      );
    });
  }
  if (!self._isPaused) {
    self.rafId = self.requestAnimationFrame(self.lossyRender);
  }
};
self.buildResult = function (ptr) {
  var items = [];
  var transferable = [];
  var item;
  while (ptr.ptr != 0) {
    item = self.buildResultItem(ptr);
    if (item !== null) {
      items.push(item);
      transferable.push(item.buffer);
    }
    ptr = ptr.next;
  }
  return [items, transferable];
};
self.buildResultItem = function (ptr) {
  var bitmap = ptr.bitmap,
    stride = ptr.stride,
    w = ptr.w,
    h = ptr.h,
    color = ptr.color;
  if (w == 0 || h == 0) {
    return null;
  }
  var r = (color >> 24) & 255,
    g = (color >> 16) & 255,
    b = (color >> 8) & 255,
    a = 255 - (color & 255);
  var result = new Uint8ClampedArray(4 * w * h);
  var bitmapPosition = 0;
  var resultPosition = 0;
  for (var y = 0; y < h; ++y) {
    for (var x = 0; x < w; ++x) {
      var k = (Module.HEAPU8[bitmap + bitmapPosition + x] * a) / 255;
      result[resultPosition] = r;
      result[resultPosition + 1] = g;
      result[resultPosition + 2] = b;
      result[resultPosition + 3] = k;
      resultPosition += 4;
    }
    bitmapPosition += stride;
  }
  x = ptr.dst_x;
  y = ptr.dst_y;
  return { w: w, h: h, x: x, y: y, buffer: result.buffer };
};
if (typeof SDL !== 'undefined') {
  SDL.defaults.copyOnLock = false;
  SDL.defaults.discardOnLock = false;
  SDL.defaults.opaqueFrontBuffer = false;
}
function parseAss(content) {
  var m, format, lastPart, parts, key, value, tmp, i, j, body;
  var sections = [];
  var lines = content.split(/[\r\n]+/g);
  for (i = 0; i < lines.length; i++) {
    m = lines[i].match(/^\[(.*)\]$/);
    if (m) {
      format = null;
      sections.push({ name: m[1], body: [] });
    } else {
      if (/^\s*$/.test(lines[i])) continue;
      if (sections.length === 0) continue;
      body = sections[sections.length - 1].body;
      if (lines[i][0] === ';') {
        body.push({ type: 'comment', value: lines[i].substring(1) });
      } else {
        parts = lines[i].split(':');
        key = parts[0];
        value = parts.slice(1).join(':').trim();
        if (format || key === 'Format') {
          value = value.split(',');
          if (format && value.length > format.length) {
            lastPart = value.slice(format.length - 1).join(',');
            value = value.slice(0, format.length - 1);
            value.push(lastPart);
          }
          value = value.map(function (s) {
            return s.trim();
          });
          if (format) {
            tmp = {};
            for (j = 0; j < value.length; j++) {
              tmp[format[j]] = value[j];
            }
            value = tmp;
          }
        }
        if (key === 'Format') {
          format = value;
        }
        body.push({ key: key, value: value });
      }
    }
  }
  return sections;
}
self.requestAnimationFrame = (function () {
  var nextRAF = 0;
  return function (func) {
    var now = Date.now;
    if (nextRAF === 0) {
      nextRAF = now + 1e3 / self.targetFps;
    } else {
      while (now + 2 >= nextRAF) {
        nextRAF += 1e3 / self.targetFps;
      }
    }
    var delay = Math.max(nextRAF - now, 0);
    return setTimeout(func, delay);
  };
})();
var screen = { width: 0, height: 0 };
Module.print = function Module_print(x) {
  postMessage({ target: 'stdout', content: x });
};
Module.printErr = function Module_printErr(x) {
  postMessage({ target: 'stderr', content: x });
};
var frameId = 0;
var clientFrameId = 0;
var commandBuffer = [];
var postMainLoop = Module['postMainLoop'];
Module['postMainLoop'] = function () {
  if (postMainLoop) postMainLoop();
  postMessage({ target: 'tick', id: frameId++ });
  commandBuffer = [];
};
addRunDependency('worker-init');
var messageBuffer = null;
var messageResenderTimeout = null;
function messageResender() {
  if (calledMain) {
    assert(messageBuffer && messageBuffer.length > 0);
    messageResenderTimeout = null;
    messageBuffer.forEach(function (message) {
      onmessage(message);
    });
    messageBuffer = null;
  } else {
    messageResenderTimeout = setTimeout(messageResender, 50);
  }
}
function _applyKeys(input, output) {
  var vargs = Object.keys(input);
  for (var i = 0; i < vargs.length; i++) {
    output[vargs[i]] = input[vargs[i]];
  }
}
function onMessageFromMainEmscriptenThread(message) {
  if (!calledMain && !message.data.preMain) {
    if (!messageBuffer) {
      messageBuffer = [];
      messageResenderTimeout = setTimeout(messageResender, 50);
    }
    messageBuffer.push(message);
    return;
  }
  if (calledMain && messageResenderTimeout) {
    clearTimeout(messageResenderTimeout);
    messageResender();
  }
  switch (message.data.target) {
    case 'window': {
      self.fireEvent(message.data.event);
      break;
    }
    case 'canvas': {
      if (message.data.event) {
        Module.canvas.fireEvent(message.data.event);
      } else if (message.data.width) {
        if (Module.canvas && message.data.boundingClientRect) {
          Module.canvas.boundingClientRect = message.data.boundingClientRect;
        }
        self.resize(message.data.width, message.data.height);
        self.getRenderMethod()();
      } else throw 'ey?';
      break;
    }
    case 'video': {
      if (message.data.currentTime !== undefined) {
        self.setCurrentTime(message.data.currentTime);
      }
      if (message.data.isPaused !== undefined) {
        self.setIsPaused(message.data.isPaused);
      }
      if (message.data.rate) {
        self.rate = message.data.rate;
      }
      break;
    }
    case 'tock': {
      clientFrameId = message.data.id;
      break;
    }
    case 'worker-init': {
      screen.width = self.width = message.data.width;
      screen.height = self.height = message.data.height;
      self.subUrl = message.data.subUrl;
      self.subContent = message.data.subContent;
      self.fontFiles = message.data.fonts;
      self.renderMode = message.data.renderMode;
      if (self.renderMode == 'lossy' && typeof createImageBitmap === 'undefined') {
        self.renderMode = 'wasm-blend';
        console.error("'createImageBitmap' needed for 'lossy' unsupported. Falling back to default!");
      }
      self.availableFonts = message.data.availableFonts;
      self.fallbackFont = message.data.fallbackFont;
      self.lazyFileLoading = message.data.lazyFileLoading;
      self.debug = message.data.debug;
      if (!hasNativeConsole && self.debug) {
        console = makeCustomConsole();
        console.log('overridden console');
      }
      if (Module.canvas) {
        Module.canvas.width_ = message.data.width;
        Module.canvas.height_ = message.data.height;
        if (message.data.boundingClientRect) {
          Module.canvas.boundingClientRect = message.data.boundingClientRect;
        }
      }
      self.targetFps = message.data.targetFps || self.targetFps;
      self.libassMemoryLimit = message.data.libassMemoryLimit || self.libassMemoryLimit;
      self.libassGlyphLimit = message.data.libassGlyphLimit || 0;
      self.dropAllAnimations = !!message.data.dropAllAnimations || self.dropAllAnimations;
      removeRunDependency('worker-init');
      postMessage({ target: 'ready' });
      break;
    }
    case 'destroy':
      self.octObj.quitLibrary();
      break;
    case 'free-track':
      self.freeTrack();
      break;
    case 'set-track':
      self.setTrack(message.data.content);
      break;
    case 'set-track-by-url':
      self.setTrackByUrl(message.data.url);
      break;
    case 'create-event':
      var event = message.data.event;
      var i = self.octObj.allocEvent();
      var evnt_ptr = self.octObj.track.get_events(i);
      _applyKeys(event, evnt_ptr);
      break;
    case 'get-events':
      var events = [];
      for (var i = 0; i < self.octObj.getEventCount(); i++) {
        var evnt_ptr = self.octObj.track.get_events(i);
        var event = {
          _index: i,
          Start: evnt_ptr.get_Start(),
          Duration: evnt_ptr.get_Duration(),
          ReadOrder: evnt_ptr.get_ReadOrder(),
          Layer: evnt_ptr.get_Layer(),
          Style: evnt_ptr.get_Style(),
          Name: evnt_ptr.get_Name(),
          MarginL: evnt_ptr.get_MarginL(),
          MarginR: evnt_ptr.get_MarginR(),
          MarginV: evnt_ptr.get_MarginV(),
          Effect: evnt_ptr.get_Effect(),
          Text: evnt_ptr.get_Text(),
        };
        events.push(event);
      }
      postMessage({ target: 'get-events', time: Date.now, events: events });
      break;
    case 'set-event':
      var event = message.data.event;
      var i = message.data.index;
      var evnt_ptr = self.octObj.track.get_events(i);
      _applyKeys(event, evnt_ptr);
      break;
    case 'remove-event':
      var i = message.data.index;
      self.octObj.removeEvent(i);
      break;
    case 'create-style':
      var style = message.data.style;
      var i = self.octObj.allocStyle();
      var styl_ptr = self.octObj.track.get_styles(i);
      _applyKeys(style, styl_ptr);
      break;
    case 'get-styles':
      var styles = [];
      for (var i = 0; i < self.octObj.getStyleCount(); i++) {
        var styl_ptr = self.octObj.track.get_styles(i);
        var style = {
          _index: i,
          Name: styl_ptr.get_Name(),
          FontName: styl_ptr.get_FontName(),
          FontSize: styl_ptr.get_FontSize(),
          PrimaryColour: styl_ptr.get_PrimaryColour(),
          SecondaryColour: styl_ptr.get_SecondaryColour(),
          OutlineColour: styl_ptr.get_OutlineColour(),
          BackColour: styl_ptr.get_BackColour(),
          Bold: styl_ptr.get_Bold(),
          Italic: styl_ptr.get_Italic(),
          Underline: styl_ptr.get_Underline(),
          StrikeOut: styl_ptr.get_StrikeOut(),
          ScaleX: styl_ptr.get_ScaleX(),
          ScaleY: styl_ptr.get_ScaleY(),
          Spacing: styl_ptr.get_Spacing(),
          Angle: styl_ptr.get_Angle(),
          BorderStyle: styl_ptr.get_BorderStyle(),
          Outline: styl_ptr.get_Outline(),
          Shadow: styl_ptr.get_Shadow(),
          Alignment: styl_ptr.get_Alignment(),
          MarginL: styl_ptr.get_MarginL(),
          MarginR: styl_ptr.get_MarginR(),
          MarginV: styl_ptr.get_MarginV(),
          Encoding: styl_ptr.get_Encoding(),
          treat_fontname_as_pattern: styl_ptr.get_treat_fontname_as_pattern(),
          Blur: styl_ptr.get_Blur(),
          Justify: styl_ptr.get_Justify(),
        };
        styles.push(style);
      }
      postMessage({ target: 'get-styles', time: Date.now, styles: styles });
      break;
    case 'set-style':
      var style = message.data.style;
      var i = message.data.index;
      var styl_ptr = self.octObj.track.get_styles(i);
      _applyKeys(style, styl_ptr);
      break;
    case 'remove-style':
      var i = message.data.index;
      self.octObj.removeStyle(i);
      break;
    case 'runBenchmark': {
      self.runBenchmark();
      break;
    }
    case 'custom': {
      if (Module['onCustomMessage']) {
        Module['onCustomMessage'](message);
      } else {
        throw 'Custom message received but worker Module.onCustomMessage not implemented.';
      }
      break;
    }
    case 'setimmediate': {
      if (Module['setImmediates']) Module['setImmediates'].shift()();
      break;
    }
    default:
      throw 'wha? ' + message.data.target;
  }
}
onmessage = onMessageFromMainEmscriptenThread;
self.runBenchmark = function (seconds, pos, async) {
  var totalTime = 0;
  var i = 0;
  pos = pos || 0;
  seconds = seconds || 60;
  var count = seconds * self.targetFps;
  var start = performance.now();
  var longestFrame = 0;
  var run = function () {
    var t0 = performance.now();
    pos += 1 / self.targetFps;
    self.setCurrentTime(pos);
    var t1 = performance.now();
    var diff = t1 - t0;
    totalTime += diff;
    if (diff > longestFrame) {
      longestFrame = diff;
    }
    if (i < count) {
      i++;
      if (async) {
        self.requestAnimationFrame(run);
        return false;
      } else {
        return true;
      }
    } else {
      console.log('Performance fps: ' + Math.round(1e3 / (totalTime / count)) + '');
      console.log('Real fps: ' + Math.round(1e3 / ((t1 - start) / count)) + '');
      console.log('Total time: ' + totalTime);
      console.log('Longest frame: ' + Math.ceil(longestFrame) + 'ms (' + Math.floor(1e3 / longestFrame) + ' fps)');
      return false;
    }
  };
  while (true) {
    if (!run()) {
      break;
    }
  }
};
