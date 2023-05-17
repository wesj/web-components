const VersionMadeBy = {
    0: "MS-DOS",
    1: "Amiga",
    2: "OpenVMS",
    3: "UNIX",
    4: "VM/CMS",
    5: "Atari ST",
    6: "OS/2 H.P.F.S",
    7: "Macintosh",
    8: "Z-System",
    9: "CP/M",
    10: "Windows NTFS",
    11: "MVS (OS/390 - Z/OS)",
    12: "VSE",
    13: "Acorn Risc",
    14: "VFAT",
    15: "alternate MVS",
    16: "BeOS",
    17: "Tandem",
    18: "OS/400",
    19: "OS X (Darwin)",
}

const CRCMagic = 0xdebb20e3;
class DeflateAlgorythm {
    read(reader) {
        let blocks = [];
        let hasNext = true;
        while(hasNext) {
            let header = reader.readBit(1);
            if (header) {
                console.log("Last block");
                hasNext = false;
            }

            let f1 = reader.readBit(2);
            if (f1 === 0b00) {
                console.log("Found static data");
                // skip bits till next byte
                let length = reader.read(2);
                let onesComplimentLength = reader.read(2);
                if (onesComplimentLength !== ~length) {
                    throw "Invalid data";
                }
                console.log("Static data length:", length);
                blocks.push(reader.read(length));
            } else if (f1 === 0b01) {
                // use fixed huffman codes for literal and distance codes
                console.log("Fixed huffman");
                break;
            } else if (f1 === 0b10) {
                // dynamic huffman codes
                console.log("Dyanmic huffman");
                break;
            } else if (f1 === 0b11) {
                // reserved
                throw "Error in compressed data " + f1.toString(2);
            }
        }
        return blocks;
    }
}

const CompressionMethod = {
    0: "None",
    1: "Shrunk",
    2: "Reduced with factor 1",
    3: "Reduced with factor 2",
    4: "Reduced with factor 3",
    5: "Reduced with factor 4",
    7: "Imploded",
    7: "Resized for Tokenizing compression alogorithm",
    8: DeflateAlgorythm,
    9: "Enhanced Deflating using Deflate64",
    10: "PKWare Data Compression Libarary Imploding",
    11: "Reserved",
    12: "BZip2",
    13: "Reserved",
    14: "LZMA",
    15: "Reserved",
    16: "IBM z/OS CMPSC Compression",
    17: "Reserved by PKWARE",
    18: "File is compressed using IBM TERSE (new)",
    19: "IBM LZ77 z Architecture",
    20: "deprecated (use method 93 for zstd)",
    93: "Zstandard (zstd) Compression",
    94: "MP3 Compression",
    95: "XZ Compression",
    96: "JPEG variant",
    97: "WavPack compressed data",
    98: "PPMd version I, Rev 1",
    99: "AE-x encryption marker (see APPENDIX E)"
}

class DataDescriptor {
    read(reader) {
        this.sig = this.possiblyReadSignature(reader);
        this.crc32 = this.readCrc32(reader);
        this.compresedSize = this.readCompressedSize(reader);
        this.uncompressedSize = this.readUncompressedSize(reader);
    }

    possiblyReadSignature(reader) {
        
    }

    readUncompressedSize(reader) {
        return reader.read(4);
    }

    readCompressedSize(reader) {
        return reader.read(4);
    }

    readCrc32(reader) {
        return reader.read(4);
    }
}

class ArchiveExtraDataRecord {
    static expectedSignature = 0x08064b50;

    read(reader) {
        this.sig = this.readSignature(reader);
        this.extraFieldLength = this.readExtraFieldLength(reader);
        this.extraField = this.readExtraField(reader, this.extraFieldLength);
    }

    readExtraField(reader, length) {
        return reader.readString(length);
    }

    readExtraFieldLength(reader) {
        return reader.read(2);
    }

    readSignature(reader) {
        let val = reader.read(4);
        if (val !== ArchiveExtraDataRecord.expectedSignature) {
            throw "Invalid signature " + val;
        }
        return val;
    }
}

class DigitalSignature {
    static expectedSignature = 0x05054b50;

    read(reader) {
        this.sig = this.readSignature(reader);
        this.sizeOfData = reader.read(2);
        this.signatureData = reader.readString(sizeOfData);
    }

    readSignature(reader) {
        let val = reader.read(4);
        if (val !== DigitalSignature.expectedSignature) {
            throw "Invalid signature " + val;
        }
        return val;
    }
}

function readDosDateTime(reader) {
    let time = reader.read(2);
    let second = (time >> 0) & 0b11111;
    let minute = (time >> 5) & 0b111111;
    let hour = (time >> 11)  & 0b11111;

    let date = reader.read(2);
    let year = (date >> 9) & 0b1111111;
    let month = (date >> 5) & 0b1111;
    let dayOfMonth = (date >> 0) & 0b11111;

    let d = new Date();
    d.setFullYear(year + 1980, month + 1, dayOfMonth);
    d.setSeconds(second * 2);
    d.setMinutes(minute);
    d.setHours(hour);
    return d;
}

class CentralDirectoryHeader {
    static expectedSignature = 0x02014b50;

    constructor(reader) {
        this.read(reader);
    }

    read(reader) {
        this.sig = this.readSignature(reader);
        this.versionMadeBy = this.readVersion(reader);
        this.versionNeededToExtract = this.readerVersionNeededToExtract(reader);
        this.generalPurposeBitFlag = reader.read(2);
        this.compression = this.readCompressionMethod(reader);
        this.lastModFile = readDosDateTime(reader);
        this.crc32 = reader.read(4);
        this.compressedSize = reader.read(4);
        this.uncompressedSize = reader.read(4);
        this.fileNameLength = reader.read(2);
        this.extraFieldLength = reader.read(2);
        this.fileCommentLength = reader.read(2);
        this.diskNumberStart = reader.read(2);
        this.internalFileAttributes = reader.read(2);
        this.externalFileAttributes = reader.read(4);
        this.relativeOffsetOfLocalHeader = reader.read(4);

        this.fileName = reader.readString(this.fileNameLength);
        this.extraField = reader.readString(this.extraFieldLength);
        this.fileComment = reader.readString(this.fileCommentLength);
    }

    readCompressionMethod(reader) {
        let val = reader.read(2);
        if (CompressionMethod[val]) {
            if (CompressionMethod[val] instanceof String) {
                return CompressionMethod[val];
            } else if (CompressionMethod[val].constructor) {
                return new CompressionMethod[val]();
            }
        }
        throw "Unknown compression method "  + val;
    }

    readVersion(reader) {
        let zipFormat = reader.read(1);
        
        let v = reader.read(1);
        if (VersionMadeBy[v]) {
            return VersionMadeBy[v];
        }
        throw "Invalid version made by " + v;
    }

    readerVersionNeededToExtract(reader) {
        let zipFormat = reader.read(2);
        return (zipFormat / 10) + "." + (zipFormat % 10);
    }

    readSignature(reader) {
        let val = reader.read(4);
        if (val !== CentralDirectoryHeader.expectedSignature) {
            throw "Invalid signature " + val;
        }
        return val;
    }
}

class CentralDirectory {

}

class ZipFile {
    static expectedSignature = 0x04034b50;
    constructor(reader) {
        this.readLocalFileHeader(reader);
        this.readEncryptionHeader(reader);
        this.readFileData(reader);
        this.readDataDescriptor(reader);
    }

    readLocalFileHeader(reader) {
        this.sig = this.readSignature(reader);
        this.version = this.readVersion(reader);
        this.bitFlag = this.readBitFlag(reader);
        this.compression = this.readCompressionMethod(reader);
        this.lastModify = readDosDateTime(reader);
        this.crc32 = this.readCrc32(reader);
        this.compressedSize = this.readCompressedSize(reader);
        this.uncompressedSize = this.readUncompressedSize(reader);
        this.filenameLength = this.readFileNameLength(reader);
        this.extraFieldLength = this.readExtraFieldLength(reader);
        this.fileName = this.readFileName(reader, this.filenameLength);
        this.extraField = this.readExtraField(reader, this.extraFieldLength);
        console.log(this);
    }

    readEncryptionHeader(reader) { }
    readFileData(reader) {
        if (this.uncompressedSize === 0) {
            this.data = [];
        } else {
            this.data = this.compression.read(reader);
        }
        console.log("Blocks", this.data);
    }
    readDataDescriptor(reader) { }

    readExtraField(reader, length) {
        return reader.readString(length);
    }

    readFileName(reader, length) {
        return reader.readString(length);
    }

    readExtraFieldLength(reader) {
        return reader.read(2);
    }

    readFileNameLength(reader) {
        return reader.read(2);
    }

    readUncompressedSize(reader) {
        return reader.read(4);
    }

    readCompressedSize(reader) {
        return reader.read(4);
    }

    readVersion(reader) {
        let val = reader.read(2);
        return Math.floor(val / 10) + "." + (val % 10);
    }

    readBitFlag(reader) {
        let flag = reader.read(2);
        if (flag && 1) this.isEncrypted = true;
        if (this.encryptionMethod === 6) {
            if (flag && (1 << 1)) this.slidingDictionarySize = 8000;
            else this.slidingDictionarySize = 4000;

            if (flag && (1 << 2)) this.numberOfShannoFanoTrees = 3;
            else this.numberOfShannoFanoTrees = 2;
        } else if (this.encryptionMethod === 8 || this.encryptionMethod === 9) {
            let f1 = flag && (1 << 1);
            let f2 = flag && (1 << 2);
            if (f2) {
                if (f1) this.compressionOption = "super fast";
                else this.compressionOption = "fast";
            } else {
                if (f1) this.compressionOption = "maximum";
                else this.compressionOption = "normal";
            }
        } else if (this.encryptionMethod === 14) {
            this.endOfStreamMarkerUsed = flag && (1 << 1);
        }

        if (flag && (1 << 3)) {
            // ignore crc32, compressed size, and uncompressed size for this file header
        }

        if (flag && (1 << 4)) {
            // reserved for method 8
        }

        if (flag && (1 << 5)) {
            this.isCompressedPatchedData = true;
        }

        if (flag && (1 << 6)) {
            this.requiresStrongEncryption = true;
        }

        if (flag && (1 << 11)) {
            this.requiresUTF8 = true;
        }

        return flag;
    }

    readCompressionMethod(reader) {
        let val = reader.read(2);
        if (CompressionMethod[val]) {
            if (CompressionMethod[val] instanceof String) {
                return CompressionMethod[val];
            } else if (CompressionMethod[val].constructor) {
                return new CompressionMethod[val]();
            } else {
                throw "Unexpected signature";   
            }
        }
        throw "Unknown compression method "  + val;
    }

    readLastModifyTime(reader) {
        return reader.read(2);
    }

    readLastModifyDate(reader) {
        return reader.read(2);
    }

    readCrc32(reader) {
        return reader.read(4);
    }

    readSignature(reader) {
        let val = reader.read(4);
        if (val !== ZipFile.expectedSignature) {
            throw "Invalid signature " + val;
        }
        return val;
    }
}

export default class ZipReader {
    constructor(data) {
        this.data = new Uint8Array(data);
        this.i = 0;
        this.startParse();
    }

    startParse() {
        while (this.i < this.data.length) {
            let sig = this.peek(4);

            if (sig === ZipFile.expectedSignature) {
                let f = new ZipFile(this);
                // this.read(f.compressedSize);
                console.log(f);
            } else if (sig === CentralDirectoryHeader.expectedSignature) {
                let f = new CentralDirectoryHeader(this);
                console.log(f);
                break;
            }
        }
    }

    nextBit() {
        if (!this.bit) {
            this.bit = this.next();
            this.bitPosition = 7;
        }

        let b = (this.bit >> this.bitPosition) & 1;
        this.bitPosition = this.bitPosition - 1;
        if (this.bitPosition < 0) {
            this.bit = null;
            this.bitPosition = 7;
        }
        return b;
    }

    peekBit() {
        let bit = this.bit;
        if (!bit) {
            bit = this.peek(1);
        }
        return bit && (1 << this.bitPosition);
    }

    next() {
        let d = this.data[this.i];
        this.i = this.i + 1;
        return d;
    }

    readString(length) {
        let s = "";
        for (var i = 0; i < length; i++) {
            let c = this.read(1);
            s += String.fromCharCode(c);
        }
        return s;
    }

    read(size) {
        let sum = 0;
        for (var i = 0; i < size; i++) {
            let d = this.next();
            sum += d << (i*8);
        }
        return sum;
    }

    readBit(size) {
        let sum = 0;
        for (var i = 0; i < size; i++) {
            let d = this.nextBit();
            sum += d << i;
        }
        return sum;
    }

    peek(size) {
        let sum = 0;
        for (var i = 0; i < size; i++) {
            let d = this.data[this.i + i];
            sum += d << (i*8);
        }
        return sum;
    }
}