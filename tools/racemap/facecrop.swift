import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

// usage: facecrop <input> <output.png> <size>
let args = CommandLine.arguments
guard args.count == 4, let size = Int(args[3]) else { print("usage"); exit(2) }
guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(src, 0, [kCGImageSourceShouldCacheImmediately: true] as CFDictionary) else { print("NOIMG"); exit(1) }

let req = VNDetectFaceRectanglesRequest()
try? VNImageRequestHandler(cgImage: img, options: [:]).perform([req])
let W = CGFloat(img.width), H = CGFloat(img.height)
var rect: CGRect
if let f = (req.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) {
    let b = f.boundingBox   // normalized, origin bottom-left
    let cx = (b.midX) * W, cy = (1 - b.midY) * H
    let side = min(max(b.width * W, b.height * H) * 2.3, min(W, H))
    var x = cx - side / 2, y = cy - side * 0.46
    x = max(0, min(x, W - side)); y = max(0, min(y, H - side))
    rect = CGRect(x: x, y: y, width: side, height: side)
    print("FACE")
} else {
    let side = min(W, H)
    rect = CGRect(x: (W - side) / 2, y: 0, width: side, height: side)   // top-centred fallback
    print("NOFACE")
}
guard let cropped = img.cropping(to: rect) else { exit(1) }
let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8, bytesPerRow: 0,
                    space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.interpolationQuality = .high
ctx.draw(cropped, in: CGRect(x: 0, y: 0, width: size, height: size))
let out = ctx.makeImage()!
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, out, nil)
CGImageDestinationFinalize(dest)
