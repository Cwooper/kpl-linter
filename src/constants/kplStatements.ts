// src/constants/kplStatements.ts

export interface BlockStatement {
    start: string;
    end?: string;
    snippet: string;
}

export const BLOCK_STATEMENTS: BlockStatement[] = [
    // Code blocks
    {
        start: 'code',
        end: 'endCode',
        snippet: 'code ${1:filename}\n\t$0\nendCode'
    },
    {
        start: 'header',
        end: 'endHeader',
        snippet: 'header ${1:filename}\n\t$0\nendHeader'
    },
    // Interface and Class blocks
    {
        start: 'interface',
        end: 'endInterface',
        snippet: 'interface ${1:name}\n\t$0\nendInterface'
    },
    {
        start: 'class',
        end: 'endClass',
        snippet: 'class ${1:name}\n\t$0\nendClass'
    },
    // Behavior and Function blocks
    {
        start: 'behavior',
        end: 'endBehavior',
        snippet: 'behavior ${1:name}\n\t$0\nendBehavior'
    },
    {
        start: 'function',
        end: 'endFunction',
        snippet: 'function ${1:name} ($2) $3\n\t$0\nendFunction'
    },
    {
        start: 'method',
        end: 'endMethod',
        snippet: 'method ${1:name} ($2) $3\n\t$0\nendMethod'
    },
    // Control flow blocks
    {
        start: 'if',
        end: 'endIf',
        snippet: 'if ${1:condition}\n\t$0\nendIf'
    },
    {
        start: 'while',
        end: 'endWhile',
        snippet: 'while ${1:condition}\n\t$0\nendWhile'
    },
    {
        start: 'for',
        end: 'endFor',
        snippet: 'for ${1:initialization}\n\t$0\nendFor'
    },
    {
        start: 'switch',
        end: 'endSwitch',
        snippet: 'switch ${1:expression}\n\tcase ${2:value}:\n\t\t$0\nendSwitch'
    },
    {
        start: 'try',
        end: 'endTry',
        snippet: 'try\n\t$0\n\tcatch ${1:error}\nendTry'
    },
    {
        start: 'do',
        end: 'until',
        snippet: 'do\n\t$0\nuntil ${1:condition}'
    },
    // Data structure blocks
    {
        start: 'record',
        end: 'endRecord',
        snippet: 'record\n\t${1:name}: $0\nendRecord'
    },
    {
        start: 'var',
        snippet: 'var\n\t${1:name}: $0'
    },
    // Section blocks
    {
        start: 'fields',
        snippet: 'fields\n\t${1:name}: $0'
    },
    {
        start: 'methods',
        snippet: 'methods\n\t${1:name} ($2) $0'
    }
];

export interface SpecialStatement {
    keyword: string;
    snippet: string;
}

export const SPECIAL_STATEMENTS: SpecialStatement[] = [
    {
        keyword: 'else',
        snippet: 'else\n\t$0'
    },
    {
        keyword: 'elseIf',
        snippet: 'elseIf ${1:condition}\n\t$0'
    },
    {
        keyword: 'catch',
        snippet: 'catch ${1:error}\n\t$0'
    },
    {
        keyword: 'case',
        snippet: 'case ${1:value}:\n\t$0'
    },
    {
        keyword: 'default',
        snippet: 'default:\n\t$0'
    },
];


export interface TypeDefinition {
    name: string;
    snippet: string;
    documentation?: string;
}

export const PRIMITIVE_TYPES: TypeDefinition[] = [
    {
        name: 'int',
        snippet: 'int',
        documentation: 'Integer type'
    },
    {
        name: 'char',
        snippet: 'char',
        documentation: 'Character type'
    },
    {
        name: 'bool',
        snippet: 'bool',
        documentation: 'Boolean type'
    },
    {
        name: 'double',
        snippet: 'double',
        documentation: 'Double precision floating point type'
    },
    {
        name: 'void',
        snippet: 'void',
        documentation: 'Void type'
    }
];

export const SPECIAL_TYPES: TypeDefinition[] = [
    {
        name: 'typeOfNull',
        snippet: 'typeOfNull',
        documentation: 'Type of null value'
    },
    {
        name: 'anyType',
        snippet: 'anyType',
        documentation: 'Any type'
    }
];

// Helper functions to work with statements
export const getBlockStatement = (start: string): BlockStatement | undefined => {
    return BLOCK_STATEMENTS.find(statement => statement.start === start);
};

export const getSpecialStatement = (keyword: string): SpecialStatement | undefined => {
    return SPECIAL_STATEMENTS.find(statement => statement.keyword === keyword);
};

export const isBlockStart = (word: string): boolean => {
    return BLOCK_STATEMENTS.some(statement => statement.start === word);
};

export const isBlockEnd = (word: string): boolean => {
    return BLOCK_STATEMENTS.some(statement => statement.end === word);
};

export const isSpecialStatement = (word: string): boolean => {
    return SPECIAL_STATEMENTS.some(statement => statement.keyword === word);
};

// Helper to get all available types
export const getAllTypes = (): TypeDefinition[] => [
    ...PRIMITIVE_TYPES,
    ...SPECIAL_TYPES
];

// Helper to check if something is a type name
export const isTypeName = (name: string): boolean => {
    return getAllTypes().some(type => type.name === name);
};
