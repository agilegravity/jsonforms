"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var isObject = function (schema) {
    return schema.properties !== undefined;
};
var isArray = function (schema) {
    return schema.type === 'array' && schema.items !== undefined;
};
/**
 * Convert a schema path (i.e. JSON pointer) to an array by splitting
 * at the '/' character and removing all schema-specific keywords.
 *
 * The returned value can be used to de-reference a root object by folding over it
 * and derefercing the single segments to obtain a new object.
 *
 *
 * @param {string} schemaPath the schema path to be converted
 * @returns {string[]} an array containing only non-schema-specific segments
 */
var toDataPathSegments = function (schemaPath) {
    var segments = schemaPath.split('/');
    var startFromRoot = segments[0] === '#' || segments[0] === '';
    if (startFromRoot) {
        return segments.filter(function (segment, index) {
            if (index === 0) {
                return false;
            }
            else {
                return index % 2 !== 1;
            }
        });
    }
    return segments.filter(function (segment, index) { return index % 2 !== 0; });
};
/**
 * Remove all schema-specific keywords (e.g. 'properties') from a given path.
 * @example
 * toDataPath('#/properties/foo/properties/bar') === '#/foo/bar')
 *
 * @param {string} schemaPath the schema path to be converted
 * @returns {string} the path without schema-specific keywords
 */
exports.toDataPath = function (schemaPath) {
    return toDataPathSegments(schemaPath).join('/');
};
/**
 * Resolve the given schema path against the given instance until the last
 * segment. The returned value allows easy assignment of any new value.
 *
 * @example
 * const pair = getValuePropertyPair(someData, someRef);
 * pair.instance[pair.property] = someValue;
 *
 * @param {any} instance the instance to resolve the path against
 * @param {string} schemaPath the schema path to be resolved
 * @returns {{instance: string, property: string}} an object containing
 *          the resolved instance as well the last fragment of
 */
exports.getValuePropertyPair = function (instance, schemaPath) {
    var validPathSegments = toDataPathSegments(schemaPath);
    var resolvedInstance = validPathSegments
        .slice(0, validPathSegments.length - 1)
        .map(function (segment) { return decodeURIComponent(segment); })
        .reduce(function (curInstance, decodedSegment) {
        if (!curInstance.hasOwnProperty(decodedSegment)) {
            curInstance[decodedSegment] = {};
        }
        return curInstance[decodedSegment];
    }, instance);
    return {
        instance: resolvedInstance,
        property: validPathSegments.length > 0 ?
            decodeURIComponent(validPathSegments[validPathSegments.length - 1]) : undefined
    };
};
/**
 * Resolve the given schema path in order to obtain a subschema.
 * @param {JsonSchema} schema the root schema from which to start
 * @param {string} schemaPath the schema path to be resolved
 * @returns {JsonSchema} the resolved sub-schema
 */
exports.resolveSchema = function (schema, schemaPath) {
    var validPathSegments = schemaPath.split('/');
    var invalidSegment = function (pathSegment) { return pathSegment === '#' || pathSegment === undefined || pathSegment === ''; };
    var resultSchema = validPathSegments.reduce(function (curSchema, pathSegment) {
        return invalidSegment(pathSegment) ? curSchema : curSchema[pathSegment];
    }, schema);
    if (resultSchema !== undefined && resultSchema.$ref !== undefined) {
        return retrieveResolvableSchema(schema, resultSchema.$ref);
    }
    return resultSchema;
};
/**
 * Finds all references inside the given schema.
 *
 * @param schema The {@link JsonSchema} to find the references in
 * @param result The initial result map, default: empty map (this parameter is used for recursion
 *               inside the function)
 * @param resolveTuples Whether arrays of tuples should be considered; default: false
 */
exports.findAllRefs = function (schema, result, resolveTuples) {
    if (result === void 0) { result = {}; }
    if (resolveTuples === void 0) { resolveTuples = false; }
    if (isObject(schema)) {
        Object.keys(schema.properties).forEach(function (key) {
            return exports.findAllRefs(schema.properties[key], result);
        });
    }
    if (isArray(schema)) {
        if (Array.isArray(schema.items)) {
            if (resolveTuples) {
                schema.items.forEach(function (child) { return exports.findAllRefs(child, result); });
            }
        }
        else {
            exports.findAllRefs(schema.items, result);
        }
    }
    if (Array.isArray(schema.anyOf)) {
        schema.anyOf.forEach(function (child) { return exports.findAllRefs(child, result); });
    }
    if (schema.$ref !== undefined) {
        result[schema.$ref] = schema;
    }
    // tslint:disable:no-string-literal
    if (schema['links'] !== undefined) {
        schema['links'].forEach(function (link) {
            if (!_.isEmpty(link.targetSchema.$ref)) {
                result[link.targetSchema.$ref] = schema;
            }
            else {
                exports.findAllRefs(link.targetSchema, result);
            }
        });
    }
    // tslint:enable:no-string-literal
    return result;
};
/**
 * Normalizes the schema and resolves the given ref.
 *
 * @param {JsonSchema} full the JSON schema to resolved the reference against
 * @param {string} reference the reference to be resolved
 * @returns {JsonSchema} the resolved sub-schema
 */
// disable rule because resolve is mutually recursive
// tslint:disable:only-arrow-functions
function retrieveResolvableSchema(full, reference) {
    // tslint:enable:only-arrow-functions
    var child = exports.resolveSchema(full, reference);
    var allRefs = exports.findAllRefs(child);
    var innerSelfReference = allRefs[reference];
    if (innerSelfReference !== undefined) {
        innerSelfReference.$ref = '#';
    }
    return child;
}
exports.retrieveResolvableSchema = retrieveResolvableSchema;
//# sourceMappingURL=path.util.js.map