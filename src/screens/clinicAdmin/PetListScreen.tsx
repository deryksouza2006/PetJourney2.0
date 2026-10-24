import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { ClinicPatientRow } from '../../components/clinicAdmin/ClinicPatientRow';
import { usePets } from '../../hooks/pets/usePets';
import {
    ClinicAdminStackParamList,
    ClinicAdminTabParamList,
} from '../../navigation/ClinicAdminNavigator';
import { colors, createThemedStyles, radii, spacing, typography } from '../../theme/tokens';
import { Pet } from '../../types/pet';
import { PET_SPECIES_LABELS } from '../../utils/petPresentation';

type Props = CompositeScreenProps<
    BottomTabScreenProps<ClinicAdminTabParamList, 'Pets'>,
    NativeStackScreenProps<ClinicAdminStackParamList>
>;

function normalizeSearchValue(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();
}

function matchesSearch(pet: Pet, searchTerm: string): boolean {
    if (!searchTerm) {
        return true;
    }

    return [
        pet.name,
        pet.tutorName,
        pet.breed,
        pet.species,
        PET_SPECIES_LABELS[pet.species],
    ].some((value) => (
        value ? normalizeSearchValue(value).includes(searchTerm) : false
    ));
}

export function PetListScreen({ navigation }: Props) {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const pets = usePets(page);
    const normalizedSearch = normalizeSearchValue(search);
    const filteredPets = useMemo(
        () => (pets.data?.content ?? []).filter((pet) => matchesSearch(pet, normalizedSearch)),
        [normalizedSearch, pets.data?.content],
    );

    useEffect(() => {
        if (pets.data && pets.data.totalPages > 0 && page >= pets.data.totalPages) {
            setPage(pets.data.totalPages - 1);
        }
    }, [page, pets.data]);

    function renderPet({ item }: { item: Pet }) {
        return (
            <ClinicPatientRow
                pet={item}
                onPress={() => navigation.navigate('ClinicPetDetails', { petId: item.id })}
            />
        );
    }

    function updateSearch(value: string): void {
        setSearch(value);
    }

    const hasRegisteredPets = (pets.data?.totalElements ?? 0) > 0;

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <View style={styles.headingCopy}>
                        <Text style={styles.eyebrow}>PACIENTES</Text>
                        <Text style={styles.title}>Pets da clínica</Text>
                    </View>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cadastrar paciente"
                        style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
                        onPress={() => navigation.navigate('CreatePet')}
                    >
                        <Ionicons name="add" size={20} color={colors.onPrimary} />
                        <Text style={styles.createButtonText}>Cadastrar</Text>
                    </Pressable>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        accessibilityLabel="Buscar pet ou tutor"
                        value={search}
                        onChangeText={updateSearch}
                        placeholder="Buscar pet ou tutor"
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
                            onPress={() => updateSearch('')}
                        >
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </Pressable>
                    ) : null}
                </View>

                {pets.isPending ? (
                    <View style={styles.centeredState}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando pacientes...</Text>
                    </View>
                ) : pets.isError ? (
                    <View style={styles.centeredState}>
                        <View style={styles.stateIcon}>
                            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                        </View>
                        <Text style={styles.stateTitle}>Não foi possível carregar os pacientes.</Text>
                        <Text style={styles.stateMessage}>Verifique sua conexão e tente novamente.</Text>
                        <AppButton
                            label="Tentar novamente"
                            variant="secondary"
                            size="small"
                            loading={pets.isFetching}
                            onPress={() => void pets.refetch()}
                        />
                    </View>
                ) : (
                    <FlatList
                        style={styles.listSurface}
                        data={filteredPets}
                        keyExtractor={(pet) => pet.id.toString()}
                        renderItem={renderPet}
                        ItemSeparatorComponent={() => <View style={styles.divider} />}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={filteredPets.length === 0
                            ? styles.emptyListContent
                            : undefined}
                        ListEmptyComponent={(
                            <View style={styles.emptyState}>
                                <View style={styles.stateIcon}>
                                    <Ionicons name="paw-outline" size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.stateTitle}>
                                    {hasRegisteredPets
                                        ? 'Nenhum paciente encontrado.'
                                        : 'Nenhum paciente cadastrado.'}
                                </Text>
                                <Text style={styles.stateMessage}>
                                    {hasRegisteredPets
                                        ? 'Tente buscar por pet, tutor, raça ou espécie.'
                                        : 'Cadastre o primeiro paciente da clínica.'}
                                </Text>
                                {!hasRegisteredPets ? (
                                    <AppButton
                                        label="Cadastrar paciente"
                                        size="small"
                                        onPress={() => navigation.navigate('CreatePet')}
                                    />
                                ) : null}
                            </View>
                        )}
                        ListFooterComponent={pets.data.totalPages > 1 ? (
                            <View style={styles.pagination}>
                                <PaginationControls
                                    page={pets.data.number}
                                    totalPages={pets.data.totalPages}
                                    isFirst={pets.data.first}
                                    isLast={pets.data.last}
                                    disabled={pets.isFetching}
                                    onPrevious={() => setPage(pets.data.number - 1)}
                                    onNext={() => setPage(pets.data.number + 1)}
                                />
                            </View>
                        ) : null}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((themeColors) => ({
    safeArea: { flex: 1, backgroundColor: themeColors.background },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingHorizontal: spacing.lg,
        backgroundColor: themeColors.background,
    },
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    headingCopy: { minWidth: 0, flex: 1 },
    eyebrow: {
        marginBottom: spacing.xs,
        color: themeColors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    title: {
        color: themeColors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    createButton: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radii.md,
        backgroundColor: themeColors.primaryAction,
    },
    createButtonText: {
        color: themeColors.onPrimary,
        fontSize: typography.caption,
        fontWeight: '800',
    },
    pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
    searchContainer: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.md,
        backgroundColor: themeColors.inputBackground,
    },
    searchInput: {
        minWidth: 0,
        flex: 1,
        paddingVertical: spacing.sm,
        color: themeColors.text,
        fontSize: typography.caption,
    },
    listSurface: {
        flex: 1,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 48 + spacing.lg + spacing.md,
        backgroundColor: themeColors.border,
    },
    pagination: {
        paddingHorizontal: spacing.lg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: themeColors.border,
    },
    emptyListContent: { flexGrow: 1 },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    stateIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: themeColors.primarySoft,
    },
    stateTitle: {
        color: themeColors.text,
        fontSize: typography.body,
        fontWeight: '800',
        lineHeight: 22,
        textAlign: 'center',
    },
    stateMessage: {
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
}));
