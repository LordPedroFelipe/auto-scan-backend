"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeadNoteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_lead_note_dto_1 = require("./create-lead-note.dto");
class UpdateLeadNoteDto extends (0, swagger_1.PartialType)(create_lead_note_dto_1.CreateLeadNoteDto) {
}
exports.UpdateLeadNoteDto = UpdateLeadNoteDto;
