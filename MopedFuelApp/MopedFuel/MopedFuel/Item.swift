//
//  Item.swift
//  MopedFuel
//
//  Created by Oscar Mullikin on 10/14/25.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
