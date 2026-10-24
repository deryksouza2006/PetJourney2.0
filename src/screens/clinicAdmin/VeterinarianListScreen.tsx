import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PaginationControls } from '../../components/PaginationControls';
import { VeterinarianAvatar } from '../../components/clinicAdmin/VeterinarianAvatar';
import { useTheme } from '../../contexts/ThemeContext';
import { useVeterinarians } from '../../hooks/veterinarians/useVeterinarians';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Veterinarian } from '../../types/veterinarian';

interface VeterinarianListScreenProps {
    onCreateVeterinarian: () => void;
    onOpenVeterinarian: (veterinarian: Veterinarian) => void;
    onOpenTutors: () => void;
}

function normalizeSearchValue(value: string): string {
    return value.trim().toLocaleLowerCase('pt-BR');
}

function matchesSearch(veterinarian: Veterinarian, searchTerm: string): boolean {
    if (!searchTerm) {
        return true;
    }

    return [
        veterinarian.name,
        veterinarian.email,
        veterinarian.crmv,
        veterinarian.specialty,
    ].some((value) => normalizeSearchValue(value ?? '').includes(searchTerm));
}

function getSecondaryInformation(veterinarian: Veterinarian): string {
    const specialty = veterinarian.specialty?.trim();

    if (specialty) {
        return `${specialty} · CRMV ${veterinarian.crmv}`;
    }

    return `CRMV ${veterinarian.crmv}`;
}

export function VeterinarianListScreen({
    onCreateVeterinarian,
    onOpenVeterinarian,
    onOpenTutors,
}: VeterinarianListScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const veterinarians = useVeterinarians(page);
    const searchTerm = normalizeSearchValue(search);
    const filteredVeterinarians = useMemo(
        () => (veterinarians.data?.content ?? []).filter(
            (veterinarian) => matchesSearch(veterinarian, searchTerm),
        ),
        [searchTerm, veterinarians.data?.content],
    );

    useEffect(() => {
        if (
            veterinarians.data
            && veterinarians.data.totalPages > 0
            && page >= veterinarians.data.totalPages
        ) {
            setPage(veterinarians.data.totalPages - 1);
        }
    }, [page, veterinarians.data]);

    function renderVeterinarian({ item, index }: { item: Veterinarian; index: number }) {
        return (
            <>
                {index > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir detalhes de ${item.name}, ${getSecondaryInformation(item)}`}
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                    onPress={() => onOpenVeterinarian(item)}
                >
                    <VeterinarianAvatar name={item.name} />
                    <View style={styles.rowCopy}>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.secondary} numberOfLines={2}>
                            {getSecondaryInformation(item)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </Pressable>
            </>
        );
    }

    const hasVeterinarians = (veterinarians.data?.totalElements ?? 0) > 0;
    const hasFilteredResults = filteredVeterinarians.length > 0;

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <View style={styles.headingCopy}>
                        <Text style={styles.eyebrow}>EQUIPE</Text>
                        <Text style={styles.title}>Veterinários</Text>
                        <Text style={styles.description}>
                            Profissionais vinculados à sua clínica.
                        </Text>
                    </View>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cadastrar veterinário"
                        style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}
                        onPress={onCreateVeterinarian}
                    >
                        <Ionicons name="add" size={20} color={colors.onPrimary} />
                        <Text style={styles.createButtonText}>Cadastrar</Text>
                    </Pressable>
                </View>

                <View style={styles.toolbar}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                        <TextInput
                            accessibilityLabel="Buscar veterinário"
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Buscar veterinário"
                            placeholderTextColor={colors.textSecondary}
                            selectionColor={colors.primary}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                            style={styles.searchInput}
                        />
                        {search ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Limpar busca"
                                hitSlop={8}
                                onPress={() => setSearch('')}
                            >
                                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                            </Pressable>
                        ) : null}
                    </View>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Abrir tutores"
                        style={({ pressed }) => [styles.tutorsButton, pressed && styles.buttonPressed]}
                        onPress={onOpenTutors}
                    >
                        <Ionicons name="people-outline" size={19} color={colors.primary} />
                        <Text style={styles.tutorsButtonText}>Tutores</Text>
                    </Pressable>
                </View>

                {veterinarians.isPending ? (
                    <View style={styles.centeredState}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando equipe...</Text>
                    </View>
                ) : veterinarians.isError ? (
                    <View style={styles.centeredState}>
                        <View style={styles.stateIcon}>
                            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                        </View>
                        <Text style={styles.stateTitle}>Não foi possível carregar a equipe.</Text>
                        <Text style={styles.stateMessage}>Verifique sua conexão e tente novamente.</Text>
                        <AppButton
                            label="Tentar novamente"
                            variant="secondary"
                            size="small"
                            onPress={() => void veterinarians.refetch()}
                        />
                    </View>
                ) : !hasVeterinarians ? (
                    <View style={styles.centeredState}>
                        <View style={styles.stateIcon}>
                            <Ionicons name="medkit-outline" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.stateTitle}>Nenhum veterinário cadastrado.</Text>
                        <Text style={styles.stateMessage}>
                            Cadastre o primeiro profissional da equipe.
                        </Text>
                        <AppButton
                            label="Cadastrar veterinário"
                            size="small"
                            onPress={onCreateVeterinarian}
                        />
                    </View>
                ) : !hasFilteredResults ? (
                    <View style={styles.centeredState}>
                        <View style={styles.stateIcon}>
                            <Ionicons name="search-outline" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.stateTitle}>Nenhum resultado nesta página.</Text>
                        <Text style={styles.stateMessage}>
                            Tente buscar por nome, e-mail, CRMV ou especialidade.
                        </Text>
                        {veterinarians.data.totalPages > 1 ? (
                            <PaginationControls
                                page={veterinarians.data.number}
                                totalPages={veterinarians.data.totalPages}
                                isFirst={veterinarians.data.first}
                                isLast={veterinarians.data.last}
                                disabled={veterinarians.isFetching}
                                onPrevious={() => setPage(veterinarians.data.number - 1)}
                                onNext={() => setPage(veterinarians.data.number + 1)}
                            />
                        ) : null}
                    </View>
                ) : (
                    <FlatList
                        style={styles.listContainer}
                        data={filteredVeterinarians}
                        keyExtractor={(veterinarian) => veterinarian.id.toString()}
                        renderItem={renderVeterinarian}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={
                            veterinarians.data.totalPages > 1 ? (
                                <View style={styles.pagination}>
                                    <PaginationControls
                                        page={veterinarians.data.number}
                                        totalPages={veterinarians.data.totalPages}
                                        isFirst={veterinarians.data.first}
                                        isLast={veterinarians.data.last}
                                        disabled={veterinarians.isFetching}
                                        onPrevious={() => setPage(veterinarians.data.number - 1)}
                                        onNext={() => setPage(veterinarians.data.number + 1)}
                                    />
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.background,
    },
    heading: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    headingCopy: { flex: 1 },
    eyebrow: {
        marginBottom: spacing.xs,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    title: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    createButton: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.primaryAction,
    },
    createButtonText: {
        color: colors.onPrimary,
        fontSize: typography.caption,
        fontWeight: '800',
    },
    buttonPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    searchContainer: {
        minHeight: 48,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.inputBackground,
    },
    searchInput: {
        minWidth: 0,
        flex: 1,
        paddingVertical: spacing.sm,
        color: colors.text,
        fontSize: typography.caption,
    },
    tutorsButton: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
    },
    tutorsButtonText: {
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
    },
    listContainer: { flex: 1 },
    listContent: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
    },
    pagination: {
        paddingHorizontal: spacing.lg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    row: {
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    rowPressed: { backgroundColor: colors.primarySoft },
    rowCopy: { minWidth: 0, flex: 1, marginHorizontal: spacing.md },
    name: {
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
    },
    secondary: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
        lineHeight: 17,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 46 + spacing.lg + spacing.md,
        backgroundColor: colors.border,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
    },
    stateIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: colors.primarySoft,
    },
    stateTitle: {
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    });
}
